var first_run = true
var last_balance_sig
var sync_start_balance = false
var assert = require('assert')
var n = require('numbro')
var tb = require('timebucket')
var sig = require('sig')
var CoinbaseExchange = require('coinbase-exchange')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var o = get('utils.object_get')
  var format_currency = get('utils.format_currency')
  var get_timestamp = get('utils.get_timestamp')
  var get_duration = get('utils.get_duration')
  var get_tick_str = get('utils.get_tick_str')
  var options = get('options')
  var client
  var start = new Date().getTime()
  function onOrder (err, resp, order) {
    if (err) return get('logger').error('order err', err, resp, order, {feed: 'errors'})
    if (resp.statusCode !== 200) {
      console.error(order)
      return get('logger').error('non-200 status: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
    }
    get('logger').info('gdax', c.default_selector.grey, ('order-id: ' + order.id).cyan, {data: {order: order}})
    function getStatus () {
      client.getOrder(order.id, function (err, resp, order) {
        if (err) return get('logger').error('getOrder err', err)
        if (resp.statusCode !== 200) {
          console.error(order)
          return get('logger').error('non-200 status from getOrder: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
        }
        if (order.status === 'done') {
          return get('logger').info('gdax', c.default_selector.grey, ('order ' + order.id + ' done: ' + order.done_reason).cyan, {data: {order: order}})
        }
        else {
          get('logger').info('gdax', c.default_selector.grey, ('order ' + order.id + ' ' + order.status).cyan, {data: {order: order}})
          setTimeout(getStatus, 5000)
        }
      })
    }
    getStatus()
  }
  return [
    // BEGIN DEFAULT TRADE LOGIC
    // default params
    function (tick, trigger, rs, cb) {
      rs.agent = USER_AGENT
      var sMatch = c.default_selector.match(/^([^\.]+)\.([^-]+)-([^-]+)$/)
      assert(sMatch)
      rs.exchange = sMatch[1]
      rs.asset = sMatch[2]
      rs.currency = sMatch[3]
      if (options.verbose && get('command') === 'run') {
        get('logger').info('trader', c.default_selector.grey, get_tick_str(tick.id), 'running logic'.grey, rs.asset.grey, rs.currency.grey, {feed: 'trader'})
      }
      rs.rsi_query_limit = 100 // RSI initial value lookback
      rs.rsi_periods = 26 // RSI smoothing factor
      rs.rsi_period = '5m' // RSI tick size
      rs.rsi_up = 65 // upper RSI threshold
      rs.rsi_down = 28 // lower RSI threshold
      rs.check_period = '1m' // speed to trigger actions at
      rs.selector = 'data.trades.' + c.default_selector
      rs.trade_pct = 0.98 // trade % of current balance
      rs.fee_pct = 0.0025 // apply 0.25% taker fee
      var products = get('exchanges.' + rs.exchange).products
      products.forEach(function (product) {
        if (product.asset === rs.asset && product.currency === rs.currency) {
          rs.product = product
        }
      })
      if (!rs.product) return cb(new Error('no product for ' + c.default_selector))
      rs.min_trade = n(rs.product.min_size).multiply(1).value()
      rs.sim_start_balance = 10000
      rs.min_double_wait = 86400000 * 1 // wait in ms after action before doing same action
      rs.min_reversal_wait = 86400000 * 0.75 // wait in ms after action before doing opposite action
      rs.min_performance = -0.015 // abort trades with lower performance score
      if (first_run) {
        delete rs.real_trade_warning
      }
      cb()
    },
    // sync balance if key is present and we're in the `run` command
    function (tick, trigger, rs, cb) {
      if (get('command') !== 'run' || !c.gdax_key) {
        rs.start_balance = rs.sim_start_balance
        // add timestamp for simulations
        if (c.reporter_cols.indexOf('timestamp') === -1) {
          c.reporter_cols.unshift('timestamp')
          if (get('command') === 'run') {
            get('logger').info('trader', c.default_selector.grey, ('No trader API key provided. Starting in advisor mode. --Zen').yellow, {feed: 'trader'})
          }
        }
        if (get('command') === 'sim') {
          // change reporting interval for sims
          c.reporter_sizes = ['1h']
        }
        return cb()
      }
      if (!client) {
        client = new CoinbaseExchange.AuthenticatedClient(c.gdax_key, c.gdax_secret, c.gdax_passphrase)
      }
      client.getAccounts(function (err, resp, accounts) {
        if (err) throw err
        if (resp.statusCode !== 200) {
          console.error(accounts)
          get('logger').error('non-200 status from exchange: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: accounts}})
          return cb()
        }
        rs.balance = {}
        accounts.forEach(function (account) {
          if (account.currency === rs.currency) {
            rs.balance[rs.currency] = n(account.balance).value()
          }
          else if (account.currency === rs.asset) {
            rs.balance[rs.asset] = n(account.balance).value()
          }
        })
        if (first_run) {
          sync_start_balance = true
        }
        var balance_sig = sig(rs.balance)
        if (balance_sig !== last_balance_sig) {
          get('logger').info('trader', c.default_selector.grey, 'New account balance:'.cyan, n(rs.balance[rs.asset]).format('0.000').white, rs.asset.grey, format_currency(rs.balance[rs.currency], rs.currency).yellow, rs.currency.grey, {feed: 'trader'})
          if (!rs.real_trade_warning) {
            get('logger').info('trader', c.default_selector.grey, '"Starting REAL trading! Hold on to your butts!" --Zen'.cyan, {feed: 'trader'})
            rs.real_trade_warning = true
          }
          last_balance_sig = balance_sig
        }
        cb()
      })
    },
    // record market price, balance, roi and stats
    function (tick, trigger, rs, cb) {
      // note the last close price
      var market_price = o(tick, rs.selector + '.close')
      // sometimes the tick won't have a close price for this selector.
      // keep old close price in memory.
      if (market_price) {
        rs.market_price = market_price
      }
      if (tick.size !== rs.check_period) {
        return cb()
      }
      delete rs.lookback_warning
      rs.ticks || (rs.ticks = 0)
      rs.progress || (rs.progress = 0)
      if (!rs.market_price) {
        //get('logger').info('trader', ('no close price for tick ' + tick.id).red, {feed: 'trader'})
        return cb()
      }
      if (!rs.balance) {
        // start with start_balance, neutral position
        rs.balance = {}
        rs.balance[rs.currency] = n(rs.start_balance).divide(2).value()
        rs.balance[rs.asset] = n(rs.start_balance).divide(2).divide(rs.market_price).value()
      }
      rs.consolidated_balance = n(rs.balance[rs.currency]).add(n(rs.balance[rs.asset]).multiply(rs.market_price)).value()
      if (sync_start_balance) {
        rs.start_balance = rs.consolidated_balance
        sync_start_balance = false
      }
      rs.roi = n(rs.consolidated_balance).divide(rs.start_balance).value()
      rs.ticks++
      cb()
    },
    // calculate first rsi from ticks lookback
    function (tick, trigger, rs, cb) {
      var rsi_tick_id = tb(tick.time).resize(rs.rsi_period).toString()
      if (rs.rsi && rs.rsi_tick_id && rs.rsi_tick_id !== rsi_tick_id) {
        // rsi period turnover. record last rsi for smoothing.
        rs.last_rsi = JSON.parse(JSON.stringify(rs.rsi))
        rs.rsi.samples++
        //console.error('last rsi', rs.last_rsi)
      }
      rs.rsi_tick_id = rsi_tick_id
      cb()
    },
    function (tick, trigger, rs, cb) {
      if (rs.first_rsi) {
        return cb()
      }
      // calculate first rsi
      //console.error('computing RSI', tick.id)
      var bucket = tb(tick.time).resize(rs.rsi_period)
      var params = {
        query: {
          app: get('app_name'),
          size: rs.rsi_period,
          time: {
            $lt: bucket.toMilliseconds()
          }
        },
        limit: rs.rsi_query_limit,
        sort: {
          time: -1
        }
      }
      params.query[rs.selector] = {$exists: true}
      get('ticks').select(params, function (err, lookback) {
        if (err) return cb(err)
        var missing = false
        if (lookback.length < rs.rsi_periods) {
          if (!rs.lookback_warning) {
            get('logger').info('trader', c.default_selector.grey, ('need more historical data, only have ' + lookback.length + ' of ' + rs.rsi_periods + ' ' + rs.rsi_period + ' ticks').yellow)
          }
          rs.lookback_warning = true
          return cb()
        }
        bucket.subtract(1)
        lookback.forEach(function (tick) {
          while (bucket.toMilliseconds() > tick.time) {
            get('logger').info('trader', c.default_selector.grey, ('missing RSI tick: ' + get_timestamp(bucket.toMilliseconds())).red)
            missing = true
            bucket.subtract(1)
          }
          //get('logger').info('trader', 'RSI tick OK:'.grey, get_timestamp(bucket.toMilliseconds()).green)
          bucket.subtract(1)
        })
        if (missing) {
          if (!rs.missing_warning) {
            get('logger').info('trader', c.default_selector.grey, 'missing tick data, RSI might be inaccurate. Try running `zenbot map --backfill` or wait for 3.6 for the new `zenbot repair` tool.'.red)
          }
          rs.missing_warning = true
        }
        if (!rs.missing_warning && !rs.rsi_complete_warning) {
          get('logger').info('trader', c.default_selector.grey, ('historical data OK! computing initial RSI from last ' + lookback.length + ' ' + rs.rsi_period + ' ticks').green)
          rs.rsi_complete_warning = true
        }
        withLookback(lookback.reverse())
      })
      function withLookback (lookback) {
        var init_lookback = lookback.slice(0, rs.rsi_periods + 1)
        var smooth_lookback = lookback.slice(rs.rsi_periods + 1)
        var de = o(init_lookback.pop(), rs.selector)
        var r = {}
        r.samples = init_lookback.length
        if (r.samples < rs.rsi_periods) {
          return cb()
        }
        r.close = de.close
        r.last_close = o(init_lookback[r.samples - 1], rs.selector).close
        r.current_gain = r.close > r.last_close ? n(r.close).subtract(r.last_close).value() : 0
        r.current_loss = r.close < r.last_close ? n(r.last_close).subtract(r.close).value() : 0
        var prev_close = 0
        var gain_sum = init_lookback.reduce(function (prev, curr) {
          curr = o(curr, rs.selector)
          if (!prev_close) {
            prev_close = curr.close
            return 0
          }
          var gain = curr.close > prev_close ? curr.close - prev_close : 0
          prev_close = curr.close
          return n(prev).add(gain).value()
        }, 0)
        var avg_gain = n(gain_sum).divide(r.samples).value()
        prev_close = 0
        var loss_sum = init_lookback.reduce(function (prev, curr) {
          curr = o(curr, rs.selector)
          if (!prev_close) {
            prev_close = curr.close
            return 0
          }
          var loss = curr.close < prev_close ? prev_close - curr.close : 0
          prev_close = curr.close
          return n(prev).add(loss).value()
        }, 0)
        var avg_loss = n(loss_sum).divide(r.samples).value()
        r.last_avg_gain = avg_gain
        r.last_avg_loss = avg_loss
        r.avg_gain = n(r.last_avg_gain).multiply(rs.rsi_periods - 1).add(r.current_gain).divide(rs.rsi_periods).value()
        r.avg_loss = n(r.last_avg_loss).multiply(rs.rsi_periods - 1).add(r.current_loss).divide(rs.rsi_periods).value()
        if (r.avg_loss === 0) {
          r.value = r.avg_gain ? 100 : 50
        }
        else {
          r.relative_strength = n(r.avg_gain).divide(r.avg_loss).value()
          r.value = n(100).subtract(n(100).divide(n(1).add(r.relative_strength))).value()
        }
        r.ansi = n(r.value).format('0')[r.value > 70 ? 'green' : r.value < 30 ? 'red' : 'white']
        // first rsi, calculated from prev 14 ticks
        rs.last_rsi = JSON.parse(JSON.stringify(r))
        //console.error('first rsi', r)
        rs.rsi = r
        rs.first_rsi = rs.last_rsi = JSON.parse(JSON.stringify(r))
        smooth_lookback.forEach(function (de) {
          r.last_close = r.close
          r.close = o(de, rs.selector).close
          r.samples++
          r.current_gain = r.close > r.last_close ? n(r.close).subtract(r.last_close).value() : 0
          r.current_loss = r.close < r.last_close ? n(r.last_close).subtract(r.close).value() : 0
          r.last_avg_gain = r.avg_gain
          r.last_avg_loss = r.avg_loss
          r.avg_gain = n(r.last_avg_gain).multiply(rs.rsi_periods - 1).add(r.current_gain).divide(rs.rsi_periods).value()
          r.avg_loss = n(r.last_avg_loss).multiply(rs.rsi_periods - 1).add(r.current_loss).divide(rs.rsi_periods).value()
          if (r.avg_loss === 0) {
            r.value = r.avg_gain ? 100 : 50
          }
          else {
            r.relative_strength = n(r.avg_gain).divide(r.avg_loss).value()
            r.value = n(100).subtract(n(100).divide(n(1).add(r.relative_strength))).value()
          }
          r.ansi = n(r.value).format('0')[r.value > 70 ? 'green' : r.value < 30 ? 'red' : 'white']
          rs.last_rsi = JSON.parse(JSON.stringify(r))
          //console.error('smooth', r.close, r.last_close, r.ansi)
        })
        cb()
      }
    },
    // calculate the smoothed rsi if we have last_rsi
    function (tick, trigger, rs, cb) {
      if (!rs.market_price || !rs.rsi || !rs.last_rsi) {
        return cb()
      }
      var r = rs.rsi
      //console.error('market', rs.market_price, rs.rsi)
      r.close = rs.market_price
      r.last_close = rs.last_rsi.close
      r.current_gain = r.close > r.last_close ? n(r.close).subtract(r.last_close).value() : 0
      r.current_loss = r.close < r.last_close ? n(r.last_close).subtract(r.close).value() : 0
      r.last_avg_gain = rs.last_rsi.avg_gain
      r.last_avg_loss = rs.last_rsi.avg_loss
      r.avg_gain = n(r.last_avg_gain).multiply(rs.rsi_periods - 1).add(r.current_gain).divide(rs.rsi_periods).value()
      r.avg_loss = n(r.last_avg_loss).multiply(rs.rsi_periods - 1).add(r.current_loss).divide(rs.rsi_periods).value()
      if (r.avg_loss === 0) {
        r.value = r.avg_gain ? 100 : 50
      }
      else {
        r.relative_strength = n(r.avg_gain).divide(r.avg_loss).value()
        r.value = n(100).subtract(n(100).divide(n(1).add(r.relative_strength))).value()
      }
      r.ansi = n(r.value).format('0')[r.value > 70 ? 'green' : r.value < 30 ? 'red' : 'white']
      //console.error('smooth 2', r.close, r.last_close, r.ansi)
      //process.exit()
      cb()
    },
    // detect trends from rsi
    function (tick, trigger, rs, cb) {
      var trend
      var r = rs.rsi
      if (!r) {
        return cb()
      }
      if (r.samples < rs.rsi_periods) {
        if (!rs.rsi_warning) {
          // get('logger').info('trader', c.default_selector.grey, (rs.rsi_period + ' RSI: not enough samples for tick ' + rs.rsi_tick_id + ': ' + rs.rsi.samples).red, {feed: 'trader'})
        }
        rs.rsi_warning = true
      }
      else {
        if (r.value >= rs.rsi_up) {
          trend = 'UP'
        }
        else if (r.value <= rs.rsi_down) {
          trend = 'DOWN'
        }
        else {
          trend = null
        }
      }
      if (trend !== rs.trend) {
        get('logger').info('trader', c.default_selector.grey, 'RSI:'.grey + r.ansi, ('trend: ' + rs.trend + ' -> ' + trend).yellow, {feed: 'trader'})
        delete rs.balance_warning
        delete rs.roi_warning
        delete rs.rsi_warning
        delete rs.delta_warning
        delete rs.buy_warning
        delete rs.perf_warning
        delete rs.action_warning
        delete rs.trend_warning
      }
      rs.trend = trend
      cb()
    },
    // @todo MACD
    function (tick, trigger, rs, cb) {
      cb()
    },
    // trigger trade signals from trends
    function (tick, trigger, rs, cb) {
      if (tick.size !== rs.check_period) {
        return cb()
      }
      // for run command, don't trade unless this is a new tick
      if (get('command') !== 'sim' && tick.time < start) {
        get('logger').info('trader', c.default_selector.grey, ('skipping historical tick ' + tick.id).grey, {feed: 'trader'})
        return cb()
      }
      if (rs.trend) {
        if (!rs.trend_warning && !rs.balance) {
          get('logger').info('trader', c.default_selector.grey, ('no balance to act on trend: ' + rs.trend + '!').red, {feed: 'trader'})
          rs.trend_warning = true
        }
        else if (!rs.trend_warning && !rs.market_price) {
          get('logger').info('trader', c.default_selector.grey, ('no market_price to act on trend: ' + rs.trend + '!').red, {feed: 'trader'})
          rs.trend_warning = true
        }
      }
      rs.progress = 1
      if (rs.trend && rs.balance && rs.market_price) {
        var size, new_balance = {}
        if (rs.trend === 'DOWN') {
          // calculate sell size
          size = rs.balance[rs.asset]
        }
        else if (rs.trend === 'UP') {
          // calculate buy size
          size = n(rs.balance[rs.currency]).divide(rs.market_price).value()
        }
        size = n(size || 0).multiply(rs.trade_pct).value()
        if (rs.trend === 'DOWN') {
          // SELL!
          if (rs.last_sell_time && tick.time - rs.last_sell_time <= rs.min_double_wait) {
            if (!rs.sell_warning) {
              get('logger').info('trader', c.default_selector.grey, ('too soon to sell after sell! waiting ' + get_duration(n(rs.min_double_wait).subtract(n(tick.time).subtract(rs.last_sell_time)).multiply(1000).value())).red, {feed: 'trader'})
            }
            rs.sell_warning = true
            return cb()
          }
          if (rs.last_buy_time && tick.time - rs.last_buy_time <= rs.min_reversal_wait) {
            if (!rs.sell_warning) {
              get('logger').info('trader', c.default_selector.grey, ('too soon to sell after buy! waiting ' + get_duration(n(rs.min_reversal_wait).subtract(n(tick.time).subtract(rs.last_buy_time)).multiply(1000).value())).red, {feed: 'trader'})
            }
            rs.sell_warning = true
            return cb()
          }
          new_balance[rs.currency] = n(rs.balance[rs.currency]).add(n(size).multiply(rs.market_price)).value()
          new_balance[rs.asset] = n(rs.balance[rs.asset]).subtract(size).value()
          rs.op = 'sell'
          if (!rs.action_warning) {
            get('logger').info('trader', c.default_selector.grey, ('attempting to sell ' + n(size).format('0.00000000') + ' ' + rs.asset + ' for ' + format_currency(n(size).multiply(rs.market_price).value(), rs.currency) + ' ' + rs.currency).yellow, {feed: 'trader'})
          }
          rs.action_warning = true
        }
        else if (rs.trend === 'UP') {
          // BUY!
          if (rs.last_buy_time && tick.time - rs.last_buy_time <= rs.min_double_wait) {
            if (!rs.buy_warning) {
              get('logger').info('trader', c.default_selector.grey, ('too soon to buy after buy! waiting ' + get_duration(n(rs.min_double_wait).subtract(n(tick.time).subtract(rs.last_buy_time)).multiply(1000).value())).red, {feed: 'trader'})
            }
            rs.buy_warning = true
            return cb()
          }
          if (rs.last_sell_time && tick.time - rs.last_sell_time <= rs.min_reversal_wait) {
            if (!rs.buy_warning) {
              get('logger').info('trader', c.default_selector.grey, ('too soon to buy after sell! waiting ' + get_duration(n(rs.min_reversal_wait).subtract(n(tick.time).subtract(rs.last_sell_time)).multiply(1000).value())).red, {feed: 'trader'})
            }
            rs.buy_warning = true
            return cb()
          }
          new_balance[rs.asset] = n(rs.balance[rs.asset]).add(size).value()
          new_balance[rs.currency] = n(rs.balance[rs.currency]).subtract(n(size).multiply(rs.market_price)).value()
          rs.op = 'buy'
          if (!rs.action_warning) {
            get('logger').info('trader', c.default_selector.grey, ('attempting to buy ' + n(size).format('0.00000000') + ' ' + rs.asset + ' for ' + format_currency(n(size).multiply(rs.market_price).value(), rs.currency) + ' ' + rs.currency).yellow, {feed: 'trader'})
          }
          rs.action_warning = true
        }
        else {
          // unknown trend
          get('logger').info('trader', c.default_selector.grey, ('unkown trend (' + rs.trend + ') aborting trade!').red, {feed: 'trader'})
          return cb()
        }
        // min size
        if (!size || size < rs.min_trade) {
          if (!rs.balance_warning) {
            get('logger').info('trader', c.default_selector.grey, 'trend: '.grey, rs.trend, ('not enough funds (' + (rs.op === 'sell' ? n(size).format('0.00000000') : format_currency(rs.balance[rs.currency], rs.currency)) + ' ' + (rs.op === 'sell' ? rs.asset : rs.currency) + ') to execute min. ' + rs.op + ' ' + rs.min_trade + ', aborting trade!').red, {feed: 'trader'})
          }
          rs.balance_warning = true
          return cb()
        }
        // fee calc
        rs.fee = n(size).multiply(rs.market_price).multiply(rs.fee_pct).value()
        new_balance[rs.currency] = n(new_balance[rs.currency]).subtract(rs.fee).value()
        // consolidate balance
        rs.new_end_balance = n(new_balance[rs.currency]).add(n(new_balance[rs.asset]).multiply(rs.market_price)).value()
        rs.new_roi = n(rs.new_end_balance).divide(rs.start_balance).value()
        rs.new_roi_delta = n(rs.new_roi).subtract(rs.roi || 0).value()

        if (rs.op === 'buy') {
          // % drop
          rs.performance = rs.last_sell_price ? n(rs.last_sell_price).subtract(rs.market_price).divide(rs.last_sell_price).value() : null
        }
        else {
          // % gain
          rs.performance = rs.last_buy_price ? n(rs.market_price).subtract(rs.last_buy_price).divide(rs.last_buy_price).value() : null
        }
        if (rs.min_performance && rs.performance !== null && rs.performance < rs.min_performance) {
          if (!rs.perf_warning) {
            get('logger').info('trader', c.default_selector.grey, ('aborting ' + rs.op + ' due to low perf. = ' + n(rs.performance).format('0.000')).red, {feed: 'trader'})
          }
          rs.perf_warning = true
          return cb()
        }
        if (rs.op === 'buy') {
          rs.waited = rs.last_sell_time ? get_duration(n(tick.time).subtract(rs.last_sell_time).multiply(1000).value()) : null
          rs.last_buy_time = tick.time
        }
        else {
          rs.waited = rs.last_buy_time ? get_duration(n(tick.time).subtract(rs.last_buy_time).multiply(1000).value()) : null
          rs.last_sell_time = tick.time
        }
        rs.performance_scores || (rs.performance_scores = [])
        rs.performance_scores.push(rs.performance)
        var performance_sum = rs.performance_scores.reduce(function (prev, curr) {
          return prev + curr
        }, 0)
        rs.performance_avg = n(performance_sum).divide(rs.performance_scores.length).value()
        rs.balance = new_balance
        rs.end_balance = rs.new_end_balance
        rs.roi = rs.new_roi
        rs.num_trades || (rs.num_trades = 0)
        rs.num_trades++
        var trade = {
          type: rs.op,
          asset: rs.asset,
          currency: rs.currency,
          exchange: rs.exchange,
          price: rs.market_price,
          fee: rs.fee,
          market: true,
          size: size,
          rsi: rs.rsi.value,
          roi: rs.roi,
          roi_delta: rs.new_roi_delta,
          performance: rs.performance,
          waited: rs.waited,
          balance: new_balance,
          end_balance: rs.new_end_balance
        }
        trigger(trade)
        if (client) {
          var params = {
            type: 'market',
            size: n(size).format('0.000000'),
            product_id: rs.asset + '-' + rs.currency
          }
          client[rs.op](params, function (err, resp, order) {
            onOrder(err, resp, order)
          })
        }
        else if (!rs.sim_warning) {
          get('logger').info('trader', c.default_selector.grey, ('Relax! This is a simulated trade! No real transaction will take place. --Zen').yellow, {feed: 'trader'})
          rs.sim_warning = true
        }
        if (rs.op === 'buy') {
          rs.last_buy_price = rs.market_price
        }
        else {
          rs.last_sell_price = rs.market_price
        }
        rs.last_op = rs.op
      }
      cb()
    },
    function (tick, trigger, rs, cb) {
      first_run = false
      cb()
    }
    // END DEFAULT TRADE LOGIC
  ]
}
