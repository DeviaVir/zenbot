var c = module.exports = {}
c.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
c.mongo_username = null // normally not needed
c.mongo_password = null
c.twitter_key = "" // create a twitter app, generate an access token, and add it here
c.twitter_secret = ""
c.twitter_access_token = ""
c.twitter_access_token_secret = ""
c.assets = [
  "BTC",
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
]
c.reducer_report_interval = 60000
c.enabled_plugins = [
  "bitfinex",
  "gdax",
  "poloniex",
  "server"
]
c.default_graph_period = "1h"
c.default_graph_limit = 300
c.graph_limits = [50, 100, 150, 200, 300, 500, 1000, 2000]
c.graph_selectors = [
  "gdax.BTC-USD",
  "gdax.BTC-EUR",
  "gdax.ETH-USD",
  "poloniex.BTC-USD",
  "bitfinex.BTC-USD",
  "bitfinex.ETH-USD",
  //"bitfinex.ETH-BTC",
  //"bitfinex.ETC-BTC",
  "bitfinex.LTC-USD",
  //"bitfinex.LTC-BTC",
  //"bitfinex.ETC-BTC",
  //"bitfinex.ETC-USD"
  "bitfinex.BFX-USD",
  "bitfinex.BFX-BTC"
]
c.rsi_query_limit = 100
c.rsi_periods = 14
c.rsi_reporter_selector = "gdax.BTC-USD"
c.logic = function container (get, set, clear) {
  // these callbacks will run in order on every tick.
  // return something like
  /*
  cb(null, {
    action: 'buy',
    asset: 'BTC',
    currency: 'USD',
    exchange: 'gdax',
    price: 'market',
    size: 0.01
  })
  */
  // and the action will be queued for execution.
  var o = get('utils.object_get')
  return [
    // BEGIN DEFAULT TRADE LOGIC
    // BTC/USD at GDAX: trade at market using 14-hour RSI indicator.
    function (tick, trigger, cb) {
      // act only on hour ticks
      if (tick.size !== '1h') return cb()
      // get gdax rsi
      var gdax_rsi = o(tick, 'data.trades.gdax.BTC-USD.rsi')
      // require minimum data
      if (!gdax_rsi || gdax_rsi.samples < c.rsi_periods) return cb()
      // overbought/oversold
      if (gdax_rsi > 70) {
        tick.data.overbought = true
      }
      else if gdax_rsi < 30) {
        tick.data.oversold = true
      }
      cb()
    },
    // @todo MACD
    function (tick, trigger, cb) {
      cb()
    },
    function (tick, trigger, cb) {
      if (tick.data.overbought) {
        // anticipating a reversal DOWN. sell at market.
        trigger({
          action: 'sell',
          asset: 'BTC',
          currency: 'USD',
          exchange: 'gdax',
          price: 'market',
          size: '100%'
        })
      }
      else if (tick.data.oversold) {
        // anticipating a reversal UP. buy at market.
        trigger({
          action: 'buy',
          asset: 'BTC',
          currency: 'USD',
          exchange: 'gdax',
          price: 'market',
          size: '100%'
        })
      }
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
c.backfill_days = 90
c.record_timeout = 20000
c.backfill_timeout = 10000
c.trade_report_interval = 20000
