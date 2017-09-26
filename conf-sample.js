var c = module.exports = {}

// mongo configuration
c.mongo = {}
c.mongo.host = process.env.MONGODB_PORT_27017_TCP_ADDR || 'localhost'
c.mongo.port = 27017
c.mongo.db = 'zenbot4'
c.mongo.username = null
c.mongo.password = null
// when using mongodb replication, i.e. when running a mongodb cluster, you can define your replication set here; when you are not using replication (most of the users), just set it to `null` (default).
c.mongo.replicaSet = null

// default selector. only used if omitting [selector] argument from a command.
c.selector = 'gdax.BTC-USD'
// name of default trade strategy
c.strategy = 'trend_ema'

// Exchange API keys:

// to enable GDAX trading, enter your API credentials:
c.gdax = {}
c.gdax.key = 'YOUR-API-KEY'
c.gdax.b64secret = 'YOUR-BASE64-SECRET'
c.gdax.passphrase = 'YOUR-PASSPHRASE'

// to enable Poloniex trading, enter your API credentials:
c.poloniex = {}
c.poloniex.key = 'YOUR-API-KEY'
c.poloniex.secret = 'YOUR-SECRET'
// please note: poloniex does not support market orders via the API

// to enable Kraken trading, enter your API credentials:
c.kraken = {}
c.kraken.key = 'YOUR-API-KEY'
c.kraken.secret = 'YOUR-SECRET'
// Please read API TOS on https://www.kraken.com/u/settings/api
c.kraken.tosagree = 'disagree'

// to enable Bittrex trading, enter your API credentials:
c.bittrex = {}
c.bittrex.key = 'YOUR-API-KEY'
c.bittrex.secret = 'YOUR-SECRET'
// make sure to give your API key access to only: "Trade Limit" and "Read Info",
// please note that this might change in the future.
// please note that bittrex API is limited, you cannot use backfills or sims (paper/live trading only)

// to enable Bitfinex trading, enter your API credentials:
c.bitfinex = {}
c.bitfinex.key = 'YOUR-API-KEY'
c.bitfinex.secret = 'YOUR-SECRET'
// May use 'exchange' or 'trading' wallet balances. However margin trading may not work...read the API documentation.
c.bitfinex.wallet = 'exchange'

// to enable Bitstamp trading, enter your API credentials:
c.bitstamp = {}
c.bitstamp.key = 'YOUR-API-KEY'
c.bitstamp.secret = 'YOUR-SECRET'
// A client ID is required on Bitstamp
c.bitstamp.client_id = 'YOUR-CLIENT-ID'

// to enable QuadrigaCX tranding, enter your API credentials:
c.quadriga = {}
c.quadriga.key = 'YOUR-API-KEY';

// this is the manual secret key entered by editing the API access
// and NOT the md5 hash you see in the summary
c.quadriga.secret = 'YOUR-SECRET';

// replace with the client id used at login, as a string, not number
c.quadriga.client_id = 'YOUR-CLIENT-ID';

// to enable BTC-e trading, enter your API credentials:
c.btce = {}
c.btce.key = 'YOUR-API-KEY'
c.btce.secret = 'YOUR-SECRET'

// to enable Gemini trading, enter your API credentials:
c.gemini = {}
c.gemini.key = 'YOUR-API-KEY'
c.gemini.secret = 'YOUR-API-SECRET'
// set to false to trade on the live platform API
c.gemini.sandbox = true

// Optional stop-order triggers:

// sell if price drops below this % of bought price (0 to disable)
c.sell_stop_pct = 0
// buy if price surges above this % of sold price (0 to disable)
c.buy_stop_pct = 0
// enable trailing sell stop when reaching this % profit (0 to disable)
c.profit_stop_enable_pct = 0
// maintain a trailing stop this % below the high-water mark of profit
c.profit_stop_pct = 1

// Order execution rules:

// avoid trading at a slippage above this pct
c.max_slippage_pct = 5
// buy with this % of currency balance (WARNING : sim won't work properly if you set this value to 100) 
c.buy_pct = 99
// sell with this % of asset balance (WARNING : sim won't work properly if you set this value to 100)
c.sell_pct = 99
// ms to adjust non-filled order after
c.order_adjust_time = 5000
// avoid selling at a loss below this pct set to 0 to ensure selling at a higher price...
c.max_sell_loss_pct = 25
// ms to poll order status
c.order_poll_time = 5000
// ms to wait for settlement (after an order cancel)
c.wait_for_settlement = 5000
// % to mark up or down price for orders
c.markup_pct = 0
// become a market taker (high fees) or a market maker (low fees)
c.order_type = 'maker'
// when supported by the exchange, use post only type orders.
c.post_only = true

// Misc options:

// default # days for backfill and sim commands
c.days = 14
// ms to poll new trades at
c.poll_trades = 30000
// amount of currency to start simulations with
c.currency_capital = 1000
// amount of asset to start simulations with
c.asset_capital = 0
// for sim, reverse time at the end of the graph, normalizing buy/hold to 0
c.symmetrical = false
// number of periods to calculate RSI at
c.rsi_periods = 14
// period to record balances for stats
c.balance_snapshot_period = '15m'
// avg. amount of slippage to apply to sim trades
c.avg_slippage_pct = 0.045

//xmpp configs

c.xmppon=0  // 0 xmpp disabled; 1 xmpp enabled (credentials should be correct)

if (c.xmppon) {

  c.xmpp = require('simple-xmpp');

  c.xmpp.connect({
                jid                    : 'trader@domain.com', //xmpp account trader bot
                password               : 'Password',          //xmpp password
                host                   : 'domain.com',        //xmpp domain
                port                   : 5222                 //xmpp port
  });

  c.xmppto="MeMyselfAndI@domain.com" //xmpp alert to friend
}
//end xmpp configs

