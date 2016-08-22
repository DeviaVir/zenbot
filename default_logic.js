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
  var client
  var start = new Date().getTime()
  function onOrder (err, resp, order) {
    if (err) return get('logger').error('order err', err, resp, order, {feed: 'errors'})
    if (resp.statusCode !== 200) {
      console.error(order)
      return get('logger').error('non-200 status: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
    }
    get('logger').info('gdax', ('order-id: ' + order.id).cyan, {data: {order: order}})
    function getStatus () {
      client.getOrder(order.id, function (err, resp, order) {
        if (err) return get('logger').error('getOrder err', err)
        if (resp.statusCode !== 200) {
          console.error(order)
          return get('logger').error('non-200 status from getOrder: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
        }
        if (order.status === 'done') {
          return get('logger').info('gdax', ('order ' + order.id + ' done: ' + order.done_reason).cyan, {data: {order: order}})
        }
        else {
          get('logger').info('gdax', ('order ' + order.id + ' ' + order.status).cyan, {data: {order: order}})
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
      rs.rsi_period = '1h'
      rs.rsi_up = 70
      rs.rsi_down = 30
      rs.check_period = '1m'
      rs.selector = 'data.trades.' + c.default_selector
      rs.hold_ticks = 200 // hold x check_period after trade
      rs.trade_pct = 0.98 // trade % of current balance
      rs.fee_pct = 0.0025 // apply 0.25% taker fee
      rs.min_trade = 0.1
      rs.sim_start_balance = 1000
      cb()
    },
    // sync balance if key is present and we're in the `run` command
    function (tick, trigger, rs, cb) {
      if (get('command') !== 'run' || !c.gdax_key) {
        rs.start_balance = rs.sim_start_balance
        // add timestamp for simulations
        if (c.reporter_cols.indexOf('timestamp') === -1) {
          c.reporter_cols.unshift('timestamp')
        }
        // change reporting interval for sims
        c.reporter_sizes = ['1h']
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
          get('logger').info(rs.exchange, 'balance'.grey, n(rs.balance[rs.asset]).format('0.000').white, rs.asset.grey, n(rs.balance[rs.currency]).format('0.00').yellow, rs.currency.grey, {feed: 'exchange'})
          last_balance_sig = balance_sig
        }
        cb()
      })
    },
    function (tick, trigger, rs, cb) {
      // note the last close price
      rs.market_price = o(tick, rs.selector + '.close')
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
      if (tick.size !== rs.check_period) {
        return cb()
      }
      // get rsi
      rs.rsi_tick_id = tb(tick.time).resize(rs.rsi_period).toString()
      get('ticks').load(get('app_name') + ':' + rs.rsi_tick_id, function (err, rsi_tick) {
        if (err) return cb(err)
        var rsi = o(rsi_tick || {}, rs.selector + '.rsi')
        var trend
        if (rsi) {
          rs.rsi = rsi
        }
        // require minimum data
        if (!rs.rsi) {
          if (!rs.rsi_warning) {
            get('logger').info('trader', ('no ' + rs.rsi_period + ' RSI for tick ' + rs.rsi_tick_id).red, {feed: 'trader'})
          }
          rs.rsi_warning = true
        }
        else if (rs.rsi.samples < c.rsi_periods) {
          if (!rs.rsi_warning) {
            get('logger').info('trader', (rs.rsi_period + ' RSI: not enough samples for tick ' + rs.rsi_tick_id + ': ' + rs.rsi.samples).red, {feed: 'trader'})
          }
          rs.rsi_warning = true
        }
        else {
          if (rs.rsi.value >= rs.rsi_up) {
            trend = 'UP'
          }
          else if (rs.rsi.value <= rs.rsi_down) {
            trend = 'DOWN'
          }
          else {
            trend = null
          }
        }
        if (trend !== rs.trend) {
          get('logger').info('trader', 'RSI:'.grey + rs.rsi.ansi, ('trend: ' + rs.trend + ' -> ' + trend).yellow, {feed: 'trader'})
          delete rs.balance_warning
          delete rs.roi_warning
          delete rs.rsi_warning
          delete rs.delta_warning
          //rs.hold_ticks_active = 0
        }
        rs.trend = trend
        cb()
      })
    },
    // @todo MACD
    function (tick, trigger, rs, cb) {
      cb()
    },
    // trigger trade signals
    function (tick, trigger, rs, cb) {
      // delay buying or selling, perhaps the trend intensifies
      if (rs.hold_ticks_active) {
        rs.hold_ticks_active--
      }
      if (rs.hold_ticks_active) {
        rs.progress = n(1).subtract(n(rs.hold_ticks_active).divide(rs.hold_ticks)).value()
        return cb()
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
          new_balance[rs.currency] = n(rs.balance[rs.currency]).add(n(size).multiply(rs.market_price)).value()
          new_balance[rs.asset] = n(rs.balance[rs.asset]).subtract(size).value()
          rs.op = 'sell'
        }
        else if (rs.trend === 'UP') {
          // BUY!
          new_balance[rs.asset] = n(rs.balance[rs.asset]).add(size).value()
          new_balance[rs.currency] = n(rs.balance[rs.currency]).subtract(n(size).multiply(rs.market_price)).value()
          rs.op = 'buy'
        }
        else {
          // unknown trend
          get('logger').info('trader', ('unkown trend (' + rs.trend + ') aborting trade!').red, {feed: 'trader'})
          return cb()
        }
        // min size
        if (!size || size < rs.min_trade) {
          if (!rs.balance_warning) {
            get('logger').info('trader', 'trend: '.grey, rs.trend, ('not enough balance to execute ' + rs.op + ', aborting trade!').red, {feed: 'trader'})
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
        /*
        if (rs.roi && rs.new_roi_delta < rs.min_roi_delta) {
          if (!rs.roi_warning) {
            get('logger').info('trader', ('new ROI below delta threshold (' + n(rs.new_roi_delta).format('%0.000') + ' < ' + n(rs.min_roi_delta).format('%0.000') + ') aborting ' + rs.op + '!').red, {feed: 'trader'})
          }
          rs.roi_warning = true
          return cb()
        }
        */
        rs.hold_ticks_active = rs.hold_ticks + 1
        rs.balance = new_balance
        rs.end_balance = rs.new_end_balance
        rs.roi = rs.new_roi
        rs.num_trades || (rs.num_trades = 0)
        rs.num_trades++
        if (rs.op === 'buy') {
          // % drop
          rs.performance = rs.last_sell_price ? n(rs.last_sell_price).subtract(rs.market_price).divide(rs.last_sell_price).value() : null
        }
        else {
          // % gain
          rs.performance = rs.last_buy_price ? n(rs.market_price).subtract(rs.last_buy_price).divide(rs.last_buy_price).value() : null
        }
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
          performance: rs.performance
        }
        trigger(trade)
        if (get('command') === 'run' && c.gdax_key && tick.time > start) {
          var params = {
            type: 'market',
            size: n(size).format('0.000000'),
            product_id: rs.asset + '-' + rs.currency
          }
          client[rs.op](params, function (err, resp, order) {
            onOrder(err, resp, order)
          })
        }
        if (rs.op === 'buy') {
          rs.last_buy_time = tick.time
          rs.last_buy_price = rs.market_price
        }
        else {
          rs.last_sell_time = tick.time
          rs.last_sell_price = rs.market_price
        }
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
