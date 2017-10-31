var c = module.exports = {}

c.selector = 'poloniex.LSK-BTC'
c.strategy = 'ta_macd'
// amount of currency to start simulations with
c.currency_capital = 0.1
// buy with this % of currency balance (WARNING : sim won't work properly if you set this value to 100) 
c.buy_pct = 100
// sell with this % of asset balance (WARNING : sim won't work properly if you set this value to 100)
c.sell_pct = 100
c.period = '2h'
// become a market taker (high fees) or a market maker (low fees)
c.order_type = 'maker'
c.stats = true
// c.mode = 'paper'

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
// when supported by the exchange, use post only type orders.
c.post_only = true

// Misc options:

// default # days for backfill and sim commands
c.days = 14
// ms to poll new trades at
c.poll_trades = 30000
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

// mongo configuration
c.mongo = {}
c.mongo.host = process.env.MONGODB_PORT_27017_TCP_ADDR || 'localhost'
c.mongo.port = 27017
c.mongo.db = 'zenbot4'
c.mongo.username = null
c.mongo.password = null
// when using mongodb replication, i.e. when running a mongodb cluster, you can define your replication set here; when you are not using replication (most of the users), just set it to `null` (default).
c.mongo.replicaSet = null

// Exchange API keys: 

// to enable GDAX trading, enter your API credentials:
c.gdax = {} 
c.gdax.key = '6a3f18714aea94776ec963ab3b25ec6f'
c.gdax.b64secret = 'ZqckIAn8N+FYn0FgdCMauK1Sqo0z0wtRi/xZAvB7ASMpOEb14YOWYzTjbxrM6Spx5ue1GJHnFCZ0cCwiJGdiXg=='
c.gdax.passphrase = 'm2asoyjuazi'

// to enable Poloniex trading, enter your API credentials:
c.poloniex = {}
c.poloniex.key = 'CO7659UP-LYI91GUU-Y07T71DN-7802U2LX'
c.poloniex.secret = 'b0171da8c5d72ff7e5386f3f001ee8a5cced387f25d6c9a102dfa3128348bae9b32e619c49fbb8a2d445101bf3e6046cd82168073fc8b5eb403c376d34524232'
// please note: poloniex does not support market orders via the API

// to enable Kraken trading, enter your API credentials:
c.kraken = {}
c.kraken.key = 'YOUR-API-KEY'
c.kraken.secret = 'YOUR-SECRET'
// Please read API TOS on https://www.kraken.com/u/settings/api
c.kraken.tosagree = 'disagree'

// to enable Bittrex trading, enter your API credentials:
c.bittrex = {}
c.bittrex.key = '5f6bfbc269c9452aacca6793cb079266'
c.bittrex.secret = 'a7c338ff04ac4e11ae5e33736d0b8325'
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

// to enable CEX.IO trading, enter your API credentials:
c.cexio = {}
c.cexio.username = 'YOUR-CLIENT-ID'
c.cexio.key = 'YOUR-API-KEY'
c.cexio.secret = 'YOUR-SECRET'

// to enable QuadrigaCX tranding, enter your API credentials:
c.quadriga = {}
c.quadriga.key = 'YOUR-API-KEY'
// this is the manual secret key entered by editing the API access
// and NOT the md5 hash you see in the summary
c.quadriga.secret = 'YOUR-SECRET'
// replace with the client id used at login, as a string, not number
c.quadriga.client_id = 'YOUR-CLIENT-ID'

// to enable BTC-e trading, enter your API credentials:
c.btce = {}
c.btce.key = 'YOUR-API-KEY'
c.btce.secret = 'YOUR-SECRET'

// to enable Gemini trading, enter your API credentials:
c.gemini = {}
c.gemini.key = 'YOUR-API-KEY'
c.gemini.secret = 'YOUR-SECRET'
// set to false to trade on the live platform API
c.gemini.sandbox = true

// to enable hitBTC trading, enter your API credentials:
c.hitbtc = {}
c.hitbtc.key = 'YOUR-API-KEY'
c.hitbtc.secret = 'YOUR-SECRET'

// to enable therock trading, enter your API credentials:
c.therock = {}
c.therock.key = 'YOUR-API-KEY'
c.therock.secret = 'YOUR-SECRET'

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

c.notifiers = {}

// pushbullets configs
c.notifiers.pushbullet = {}
c.notifiers.pushbullet.on = false // false pushbullets disabled; true pushbullets enabled (key should be correct)
c.notifiers.pushbullet.key = 'o.ZQplNI6pXdQERIPg11yYvqzOekN6u83b'
c.notifiers.pushbullet.deviceID = 'RKe1EAAxJTxbnoyIorlgiqQiMRVsYAiz'
// end pushbullets configs

// ifttt configs
c.notifiers.ifttt = {}
c.notifiers.ifttt.on = true // false ifttt disabled; true ifttt enabled (key should be correct)
c.notifiers.ifttt.makerKey = 'dfw52OPqoW2YhGc4bPlCEJ'
c.notifiers.ifttt.eventName = 'zenbot'
// end ifttt configs

