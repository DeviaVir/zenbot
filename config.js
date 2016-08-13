var c = module.exports = {}
c.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
c.mongo_username = null // normally not needed
c.mongo_password = null
c.bucket_size = "1m"
c.reducer_limit = 500 // how many thoughts to process per reduce run
c.reducer_sizes = ["1m", "5m", "15m", "1h", "6h", "1d"]
c.save_state_interval = 10000 // save state
c.parallel_limit = 8 // run this many concurrent tasks
c.reduce_timeout = 200
c.run_limit = 100
c.lock_timeout = 60000
c.lock_backoff = 20
c.lock_tries = 100
c.passive_update_timeout = 5000
c.return_timeout = 60000
c.brain_speed_ms = 200
c.twitter_key = "" // create a twitter app, generate an access token, and add it here
c.twitter_secret = ""
c.twitter_access_token = ""
c.twitter_access_token_secret = ""
c.assets = [
  "BTC",
<<<<<<< eb84af6b7e2df22e55752e50253fcd3eb00d7ed8
  "ETH",
  "LTC",
  "BFX",
  "ETC"
]
c.currencies = [
  "CNY",
  "CAD",
  "GBP",
  "JPY",
  "EUR",
  "USD",
  "BTC"
=======
  //"ETH",
  //"LTC"
]
c.currencies = [
  //"CNY",
  //"EUR",
  "USD"
>>>>>>> wip
]
c.enabled_plugins = [
  //"bitfinex",
  "gdax",
  //"poloniex",
  "server"
]
c.default_graph_period = "1h"
c.default_graph_limit = 300
c.graph_limits = [50, 100, 150, 200, 300, 500, 1000, 2000]
c.graph_selectors = [
  "gdax.BTC-USD",
  //"gdax.BTC-EUR",
  //"gdax.ETH-USD",
  //"poloniex.BTC-USD",
  //"bitfinex.BTC-USD",
  //"bitfinex.ETH-USD",
  //"bitfinex.ETH-BTC",
  //"bitfinex.ETC-BTC",
  //"bitfinex.LTC-USD",
  //"bitfinex.LTC-BTC",
  //"bitfinex.ETC-BTC",
  //"bitfinex.ETC-USD"
]
c.rsi_query_limit = 100
c.rsi_periods = 14
c.rsi_reporter_selector = "gdax.BTC-USD"
c.rsi_sizes = ['15m', '1h']
c.gdax_key = ''
c.gdax_secret = ''
c.gdax_passphrase = ''
var first_run = true
c.logic = function container (get, set, clear) {
  var o = get('utils.object_get')
  var n = require('numbro')
  var format_currency = get('utils.format_currency')
  var selector = 'data.trades.gdax.BTC-USD'
  var get_timestamp = get('utils.get_timestamp')
  var CoinbaseExchange = require('coinbase-exchange')
  var client = new CoinbaseExchange.AuthenticatedClient(c.gdax_key, c.gdax_secret, c.gdax_passphrase)
  function onOrder (err, resp, order) {
    if (err) return get('logger').error('order err', err, resp, order, {feed: 'errors'})
    if (resp.statusCode !== 200) {
      console.error(order)
      return get('logger').error('non-200 status from GDAX: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
    }
    get('logger').log('GDAX', ('order-id: ' + order.id).cyan, {data: {order: order}})
    function getStatus () {
      client.getOrder(order.id, function (err, resp, order) {
        if (err) return get('logger').error('getOrder err', err)
        if (resp.statusCode !== 200) {
          console.error(order)
          return get('logger').error('non-200 status from GDAX getOrder: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
        }
        if (order.status === 'done') {
          return get('logger').info('GDAX', ('order ' + order.id + ' done: ' + order.done_reason).cyan, {data: {order: order}})
        }
        else {
          get('logger').info('GDAX', ('order ' + order.id + ' ' + order.status).cyan, {data: {order: order}})
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
      if (get('command') !== 'run') {
        return cb()
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
          if (account.currency === 'USD') {
            rs.balance.USD = n(account.balance).value()
          }
          else if (account.currency === 'BTC') {
            rs.balance.BTC = n(account.balance).value()
          }
        })
        if (first_run) {
          get('logger').info('GDAX', 'starting balance'.grey, n(rs.balance.BTC).format('0.000').white, 'BTC'.grey, n(rs.balance.USD).format('0.00').yellow, 'USD'.grey, {feed: 'exchange'})
          first_run = false
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
      // BTC/USD at GDAX: trade at market using 15m RSI indicator.
      if (!rs.market_price) return cb()
      if (!rs.balance) {
        // start with $1000, neutral position
        rs.balance = {
          USD: 500,
          BTC: n(500).divide(rs.market_price).value()
        }
      }
      rs.ticks || (rs.ticks = 0)
      rs.ticks++
      if (tick.size !== '15m') return cb()
      // get gdax rsi
      var gdax_rsi = o(tick, selector + '.rsi')
      // require minimum data
      // overbought/oversold
      // sanity check
      if (gdax_rsi && gdax_rsi.samples >= c.rsi_periods) {
        rs.gdax_rsi = Math.round(gdax_rsi.value)
        if (gdax_rsi.value > 70) {
          rs.overbought = true
          rs.oversold = false
          //console.error('overbought', format_currency(gdax_rsi.last_close, 'USD').red)
        }
        else if (gdax_rsi.value < 30) {
          rs.oversold = true
          rs.overbought = false
          //console.error('oversold', format_currency(gdax_rsi.last_close, 'USD').green)
        }
      }
      cb()
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
          get('logger').info('trader', 'anticipating a reversal DOWN. sell at market. (' + Math.round(rs.market_price) + ')', {feed: 'trader'})
          size = rs.balance.BTC
        }
        else if (rs.oversold) {
          get('logger').info('trader', 'anticipating a reversal UP. buy at market. (' + Math.round(rs.market_price) + ')', {feed: 'trader'})
          size = n(rs.balance.USD).divide(rs.market_price).value()
        }
        if (!size) {
          return cb()
        }
        // scale down size a little, to prevent out-of-balance errors
        size = n(size).multiply(0.95).value()
        if (rs.overbought) {
          new_balance.USD = n(rs.balance.USD).add(n(size).multiply(rs.market_price)).value()
          new_balance.BTC = 0
        }
        else if (rs.oversold) {
          new_balance.BTC = n(rs.balance.BTC).add(size).value()
          new_balance.USD = 0
        }
        // consolidate balance
        var new_end_balance = n(new_balance.USD).add(n(new_balance.BTC).multiply(rs.market_price)).value()
        var new_roi = n(new_end_balance).divide(1000).value()
        rs.balance = new_balance
        rs.end_balance = new_end_balance
        rs.roi = new_roi
        rs.trades || (rs.trades = 0)
        rs.trades++
        trigger({
          type: rs.overbought ? 'sell' : 'buy',
          asset: 'BTC',
          currency: 'USD',
          exchange: 'gdax',
          price: rs.market_price,
          market: true,
          size: size,
          gdax_rsi: rs.gdax_rsi,
          roi: rs.roi
        })
        if (get('command') === 'run') {
          var params = {
            type: 'market',
            size: n(size).format('0.000000'),
            product_id: 'BTC-USD'
          }
          client[rs.overbought ? 'sell' : 'buy'](params, function (err, resp, order) {
            onOrder(err, resp, order)
          })
        }
      }
      cb()
    }
    // END DEFAULT TRADE LOGIC
  ]
}
c.price_reporter_selector = "gdax.BTC-USD"
c.price_reporter_length = 8
c.reporter_cols = [
  "tick_id",
  "timestamp",
  "num_trades",
  "volume",
  "price",
  "rsi"
]
c.backfill_days = 91
c.record_timeout = 20000
c.backfill_timeout = 5000
c.reducer_report_interval = 2000
c.trade_report_interval = 10000
c.sim_input_unit = "7d"
c.sim_input_limit = 12
