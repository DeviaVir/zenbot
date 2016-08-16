var first_run = true
var last_balance_sig

module.exports = function container (get, set, clear) {
  var c = get('config')
  var o = get('utils.object_get')
  var n = require('numbro')
  var tb = require('timebucket')
  var sig = require('sig')
  var format_currency = get('utils.format_currency')
  var get_timestamp = get('utils.get_timestamp')
  var CoinbaseExchange = require('coinbase-exchange')
  var client
  var asset = 'BTC'
  var currency = 'USD'
  var rsi_period = '15m'
  var rsi_overbought = 70
  var rsi_oversold = 20
  var check_period = '1m'
  var exchange = 'gdax'
  var selector = 'data.trades.' + exchange + '.' + asset + '-' + currency
  var recovery_ticks = 300
  var trade_pct = 0.95
  var min_trade = 0.01
  var start_balance = 1000
  function onOrder (err, resp, order) {
    if (err) return get('logger').error('order err', err, resp, order, {feed: 'errors'})
    if (resp.statusCode !== 200) {
      console.error(order)
      return get('logger').error('non-200 status: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
    }
    get('logger').info(exchange, ('order-id: ' + order.id).cyan, {data: {order: order}})
    function getStatus () {
      client.getOrder(order.id, function (err, resp, order) {
        if (err) return get('logger').error('getOrder err', err)
        if (resp.statusCode !== 200) {
          console.error(order)
          return get('logger').error('non-200 status from getOrder: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
        }
        if (order.status === 'done') {
          return get('logger').info(exchange, ('order ' + order.id + ' done: ' + order.done_reason).cyan, {data: {order: order}})
        }
        else {
          get('logger').info(exchange, ('order ' + order.id + ' ' + order.status).cyan, {data: {order: order}})
          setTimeout(getStatus, 5000)
        }
      })
    }
    getStatus()
  }
  return [
    // BEGIN DEFAULT TRADE LOGIC
    // sync balance
    function (tick, trigger, rs, cb) {
      if (get('command') !== 'run' || !c.key) {
        return cb()
      }
      if (!client) {
        client = new CoinbaseExchange.AuthenticatedClient(c.key, c.secret, c.passphrase)
      }
      client.getAccounts(function (err, resp, accounts) {
        if (err) throw err
        if (resp.statusCode !== 200) {
          console.error(accounts)
          get('logger').error('non-200 status from exchange: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: accounts}})
          return cb && cb()
        }
        rs.balance = {}
        accounts.forEach(function (account) {
          if (account.currency === currency) {
            rs.balance[currency] = n(account.balance).value()
          }
          else if (account.currency === asset) {
            rs.balance[asset] = n(account.balance).value()
          }
        })
        var balance_sig = sig(rs.balance)
        if (balance_sig !== last_balance_sig) {
          get('logger').info(exchange, 'balance'.grey, n(rs.balance[asset]).format('0.000').white, asset.grey, n(rs.balance[currency]).format('0.00').yellow, currency.grey, {feed: 'exchange'})
          first_run = false
          last_balance_sig = balance_sig
        }
        cb && cb()
      })
    },
    function (tick, trigger, rs, cb) {
      // note the last close price
      var market_price = o(tick, selector + '.close')
      if (market_price) {
        rs.market_price = market_price
      }
      rs.ticks || (rs.ticks = 0)
      rs.progress || (rs.progress = 0)
      if (!rs.market_price) return cb()
      if (!rs.balance) {
        // start with start_balance, neutral position
        rs.balance = {}
        rs.balance[currency] = start_balance/2
        rs.balance[asset] = n(start_balance/2).divide(rs.market_price).value()
      }
      rs.ticks++
      if (tick.size !== check_period) {
        return cb()
      }
      rs.progress = 1
      if (rs.recovery_ticks) {
        rs.recovery_ticks--
      }
      // what % are we to a decision?
      rs.progress = recovery_ticks ? n(1).subtract(n(rs.recovery_ticks).divide(recovery_ticks)).value() : 1
      if (rs.recovery_ticks) {
        return cb()
      }
      // check price diff
      var close = o(tick || {}, selector + '.close')
      // get rsi
      var rsi_tick_id = tb(tick.time).resize(rsi_period).toString()
      get('ticks').load(get('app_name') + ':' + rsi_tick_id, function (err, rsi_tick) {
        if (err) return cb(err)
        var rsi = o(rsi_tick || {}, selector + '.rsi')
        var rsi_open = o(rsi_tick || {}, selector + '.open')
        // require minimum data
        // overbought/oversold
        // sanity check
        close || (close = o(rsi_tick || {}, selector + '.close'))
        rs.check_diff = close ? n(close).subtract(rsi_open || close).value() : rs.check_diff || null
        rs.last_close = close
        if (!rsi) {
          get('logger').info('trader', ('no ' + rsi_period + ' RSI').red, {feed: 'trader'})
        }
        else if (rsi.samples < c.rsi_periods) {
          get('logger').info('trader', (rsi_period + ' RSI: not enough samples: ' + rsi.samples).red, {feed: 'trader'})
        }
        else if (!close) {
          get('logger').info('trader', ('no close price').red, {feed: 'trader'})
        }
        else if (rs.check_diff === null) {
          get('logger').info('trader', ('not enough ticks to make decision').red, {feed: 'trader'})
        }
        else {
          rs.rsi = Math.round(rsi.value)
          rs.rsi_ansi = rsi.ansi
          if (rsi.value >= rsi_overbought && !rs.recovery_ticks) {
            rs.overbought = true
          }
          else if (rsi.value <= rsi_oversold && !rs.recovery_ticks) {
            rs.oversold = true
          }
          else {
            get('logger').info('trader', (rsi_period + ' RSI: ').grey + rsi.ansi + ' diff: '.grey + format_currency(rs.check_diff, currency).grey, {feed: 'trader'})
          }
        }
        rs.recovery_ticks = recovery_ticks + 1
        cb()
      })
    },
    // @todo MACD
    function (tick, trigger, rs, cb) {
      cb()
    },
    // trigger trade signals
    function (tick, trigger, rs, cb) {
      if ((rs.overbought || rs.oversold) && rs.balance && rs.market_price) {
        var size, new_balance = {}
        if (rs.overbought) {
          get('logger').info('trader', 'RSI:'.grey + rs.rsi_ansi, 'anticipating a reversal DOWN. sell at market. (' + format_currency(rs.market_price, currency) + ') diff: ' + format_currency(rs.check_diff, currency), {feed: 'trader'})
          size = rs.balance[asset]
        }
        else if (rs.oversold) {
          get('logger').info('trader', 'RSI:'.grey + rs.rsi_ansi, 'anticipating a reversal UP. buy at market. (' + format_currency(rs.market_price, currency) + ') diff: ' + format_currency(rs.check_diff, currency), {feed: 'trader'})
          size = n(rs.balance[currency]).divide(rs.market_price).value()
        }
        // scale down size a little, to prevent out-of-balance errors
        size = n(size || 0).multiply(trade_pct).value()
        // min size
        if (!size || size < min_trade) {
          if (rs.overbought) {
            get('logger').info('trader', 'RSI:'.grey + rs.rsi_ansi, ('not enough ' + asset + ' to execute sell!').red, {feed: 'trader'})
          }
          else if (rs.oversold) {
            get('logger').info('trader', 'RSI:'.grey + rs.rsi_ansi, ('not enough ' + currency + ' to execute buy!').red, {feed: 'trader'})
          }
          rs.overbought = rs.oversold = false
          return cb()
        }
        if (rs.overbought) {
          new_balance[currency] = n(rs.balance[currency]).add(n(size).multiply(rs.market_price)).value()
          new_balance[asset] = n(rs.balance[asset]).subtract(size).value()
        }
        else if (rs.oversold) {
          new_balance[asset] = n(rs.balance[asset]).add(size).value()
          new_balance[currency] = n(rs.balance[currency]).subtract(n(size).multiply(rs.market_price)).value()
        }
        // consolidate balance
        var new_end_balance = n(new_balance[currency]).add(n(new_balance[asset]).multiply(rs.market_price)).value()
        var new_roi = n(new_end_balance).divide(start_balance).value()
        rs.balance = new_balance
        rs.end_balance = new_end_balance
        rs.roi = new_roi
        rs.trades || (rs.trades = 0)
        rs.trades++
        trigger({
          type: rs.overbought ? 'sell' : 'buy',
          asset: asset,
          currency: currency,
          exchange: exchange,
          price: rs.market_price,
          market: true,
          size: size,
          rsi: rs.rsi,
          roi: rs.roi
        })
        if (get('command') === 'run' && c.key) {
          var params = {
            type: 'market',
            size: n(size).format('0.000000'),
            product_id: asset + '-' + currency
          }
          client[rs.overbought ? 'sell' : 'buy'](params, function (err, resp, order) {
            onOrder(err, resp, order)
          })
        }
        rs.overbought = rs.oversold = false
      }
      cb()
    }
    // END DEFAULT TRADE LOGIC
  ]
}
