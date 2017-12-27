var c = module.exports = {}

/// This conf is for NEURAL strategy as a profitable sim example, use --period=1m

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
c.selector = 'poloniex.BCH-BTC'
// name of default trade strategy
c.strategy = 'neural'

// Exchange API keys:

// to enable GDAX trading, enter your API credentials:
c.gdax = {}
c.gdax.key = 'XXX'
c.gdax.b64secret = 'XXX'
c.gdax.passphrase = 'XXX'

// to enable Poloniex trading, enter your API credentials:
c.poloniex = {}
c.poloniex.key = 'KEY'
c.poloniex.secret = 'SECRET'
// please note: poloniex does not support market orders via the API

// to enable Kraken trading, enter your API credentials:
c.kraken = {}
c.kraken.key = 'YOUR-API-KEY'
c.kraken.secret = 'YOUR-SECRET'
// Please read API TOS on https://www.kraken.com/u/settings/api
c.kraken.tosagree = 'disagree'

// to enable Binance trading, enter your API credentials:
c.binance = {}
c.binance.key = 'YOUR-API-KEY'
c.binance.secret = 'YOUR-SECRET'

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

// to enable WEX.NZ trading, enter your API credentials:
// Note: WexNZ only supports backfilling the last ~1/4 day ATM.
c.wexnz = {}
c.wexnz.key = 'YOUR-API-KEY'
c.wexnz.secret = 'YOUR-SECRET'

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
c.buy_pct = 100
// sell with this % of asset balance (WARNING : sim won't work properly if you set this value to 100)
c.sell_pct = 100
// ms to adjust non-filled order after
c.order_adjust_time = 15000
// avoid selling at a loss below this pct set to 0 to ensure selling at a higher price...
c.max_sell_loss_pct = 25
// ms to poll order status
c.order_poll_time = 15000
// ms to wait for settlement (after an order cancel)
c.wait_for_settlement = 5000
// % to mark down buy price for orders
c.markdown_buy_pct = 0.5
// % to mark up sell prie for orders
c.markup_sell_pct = 0.5
// become a market taker (high fees) or a market maker (low fees)
c.order_type = 'maker'
// when supported by the exchange, use post only type orders.
c.post_only = true

// Misc options:

// default # days for backfill and sim commands
c.days = 14
// ms to poll new trades at
c.poll_trades = 15000
// amount of currency to start simulations with
c.currency_capital = 1
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
// time to leave an order open, default to 1 day (this feature is not supported on all exchanges, currently: GDAX)
c.cancel_after = 'day'

// Notifiers:
c.notifiers = {}

// xmpp config
c.notifiers.xmpp = {}
c.notifiers.xmpp.on = false  // false xmpp disabled; true xmpp enabled (credentials should be correct)
c.notifiers.xmpp.jid = 'trader@domain.com'
c.notifiers.xmpp.password = 'Password'
c.notifiers.xmpp.host = 'domain.com'
c.notifiers.xmpp.port = 5222
c.notifiers.xmpp.to = 'MeMyselfAndI@domain.com'
// end xmpp configs

// pushbullets configs
c.notifiers.pushbullet = {}
c.notifiers.pushbullet.on = false // false pushbullets disabled; true pushbullets enabled (key should be correct)
c.notifiers.pushbullet.key = 'YOUR-API-KEY'
c.notifiers.pushbullet.deviceID = 'YOUR-DEVICE-ID'
// end pushbullets configs

// ifttt configs
c.notifiers.ifttt = {}
c.notifiers.ifttt.on = false // false ifttt disabled; true ifttt enabled (key should be correct)
c.notifiers.ifttt.makerKey = 'YOUR-API-KEY'
c.notifiers.ifttt.eventName = 'zenbot'
// end ifttt configs

// slack config
c.notifiers.slack = {}
c.notifiers.slack.on = false
c.notifiers.slack.webhook_url = ''
// end slack config

// discord configs
c.notifiers.discord = {}
c.notifiers.discord.on = false // false discord disabled; true discord enabled (key should be correct)
c.notifiers.discord.id = 'YOUR-WEBHOOK-ID'
c.notifiers.discord.token = 'YOUR-WEBHOOK-TOKEN'
// end discord configs

// prowl configs
c.notifiers.prowl = {}
c.notifiers.prowl.on = false // false prowl disabled; true prowl enabled (key should be correct)
c.notifiers.prowl.key = 'YOUR-API-KEY'
// end prowl configs

// textbelt configs
c.notifiers.textbelt = {}
c.notifiers.textbelt.on = false // false textbelt disabled; true textbelt enabled (key should be correct)
c.notifiers.textbelt.phone = '3121234567'
c.notifiers.textbelt.key = 'textbelt'
// end textbelt configs

// output
c.output  = {}

// REST API
c.output.api = {}
c.output.api.on = true
c.output.api.port = 0 // 0 = random port
