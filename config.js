var c = module.exports = {}
c.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
c.mongo_username = null // normally not needed
c.mongo_password = null
c.bucket_size = "10s"
c.reducer_limit = 500 // how many thoughts to process per reduce run
c.reducer_sizes = ["10s", "1m", "5m", "15m", "1h", "6h", "1d"]
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
  //"ETH",
  //"LTC"
]
c.currencies = [
  //"CNY",
  //"EUR",
  "USD"
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
c.rsi_sizes = ['10s', '15m', '1h']
c.key = ''
c.secret = ''
c.passphrase = ''
var first_run = true
var last_balance_sig
c.logic = function container (get, set, clear) {
  var o = get('utils.object_get')
  var n = require('numbro')
  var sig = require('sig')
  var format_currency = get('utils.format_currency')
  var get_timestamp = get('utils.get_timestamp')
  var CoinbaseExchange = require('coinbase-exchange')
  var client = new CoinbaseExchange.AuthenticatedClient(c.key, c.secret, c.passphrase)
  var asset = 'BTC'
  var currency = 'USD'
  var rsi_period = '15m'
  var exchange = 'gdax'
  var selector = 'data.trades.' + exchange + '.' + asset + '-' + currency
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
      // Trade at market using 15m RSI indicator.
      if (!rs.market_price) return cb()
      if (!rs.balance) {
        // start with $1000, neutral position
        rs.balance = {}
        rs.balance[currency] = 500
        rs.balance[asset] = n(500).divide(rs.market_price).value()
      }
      rs.ticks || (rs.ticks = 0)
      rs.ticks++
      if (tick.size !== rsi_period) return cb()
      // get rsi
      var rsi = o(tick, selector + '.rsi')
      // require minimum data
      // overbought/oversold
      // sanity check
      if (rsi && rsi.samples >= c.rsi_periods) {
        rs.rsi = Math.round(rsi.value)
        rs.rsi_ansi = rsi.ansi
        if (rsi.value > 70) {
          rs.overbought = true
          rs.oversold = false
        }
        else if (rsi.value < 30) {
          rs.oversold = true
          rs.overbought = false
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
          get('logger').info('trader', 'RSI:'.grey + rs.rsi_ansi, 'anticipating a reversal DOWN. sell at market. (' + format_currency(rs.market_price, currency) + ')', {feed: 'trader'})
          size = rs.balance[asset]
        }
        else if (rs.oversold) {
          get('logger').info('trader', 'RSI:'.grey + rs.rsi_ansi, 'anticipating a reversal UP. buy at market. (' + format_currency(rs.market_price, currency) + ')', {feed: 'trader'})
          size = n(rs.balance[currency]).divide(rs.market_price).value()
        }
        // scale down size a little, to prevent out-of-balance errors
        size = n(size || 0).multiply(0.95).value()
        // min size
        if (!size || size < 0.01) {
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
        var new_roi = n(new_end_balance).divide(1000).value()
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
c.reporter_sizes = ['10s']
c.price_reporter_selector = "gdax.BTC-USD"
c.price_reporter_length = 9
c.reporter_cols = [
  "tick_id",
  "num_trades",
  "timestamp",
  "rsi",
  "volume",
  "price"
]
c.backfill_days = 91
c.record_timeout = 20000
c.backfill_timeout = 5000
c.reducer_report_interval = 2000
c.trade_report_interval = 10000
c.sim_input_unit = "7d"
c.sim_input_limit = 12
c.log_query_limit = 200
c.tracking_scripts = ''

