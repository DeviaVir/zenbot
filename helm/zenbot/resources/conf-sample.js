var c = module.exports = {}

// mongo configuration
c.mongo = {}
c.mongo.db = {{ .Values.mongodb.auth.database | default "zenbot4" | quote }}

// Must provide EITHER c.mongo.connectionString OR c.mongo.host,port,username,password
//c.mongo.connectionString = null

// The following is not needed when c.mongo.connectionString is provided:
c.mongo.host = '{{ template "zenbot.fullname" . }}-mongodb'
c.mongo.port = 27017
c.mongo.username = {{ .Values.mongodb.auth.username | quote | default "null" }}
c.mongo.password = {{ .Values.mongodb.auth.password | quote | default "null" }}
// when using mongodb replication, i.e. when running a mongodb cluster, you can define your replication set here; when you are not using replication (most of the users), just set it to `null` (default).
c.mongo.replicaSet = {{ .Values.env.ZENBOT_MONGO_REPLICASET | default "null" }}
c.mongo.authMechanism = {{ .Values.env.ZENBOT_MONGO_AUTH_MECHANISM | default "null" }}

// default selector. only used if omitting [selector] argument from a command.
c.selector = {{ .Values.env.ZENBOT_DEFAULT_SELECTOR | default "gdax.BTC-USD" | quote }}
// name of default trade strategy
c.strategy = {{ .Values.env.ZENBOT_DEFAULT_STRATEGY | default "trend_ema " | quote }}

// Exchange API keys:

// to enable GDAX trading, enter your API credentials:
c.gdax = {}
c.gdax.key = {{ .Values.env.ZENBOT_GDAX_API_KEY | default "YOUR-API-KEY" | quote }}
c.gdax.b64secret = {{ .Values.env.ZENBOT_GDAX_B64_SECRET | default "YOUR-API-SECRET" | quote }}
c.gdax.passphrase = {{ .Values.env.ZENBOT_GDAX_PASSPHRASE | default "YOUR-API-PASSPHRASE" | quote }}

// to enable Poloniex trading, enter your API credentials:
c.poloniex = {}
c.poloniex.key = {{ .Values.env.ZENBOT_POLONIEX_API_KEY | default "YOUR-API-KEY" | quote }}
c.poloniex.secret = {{ .Values.env.ZENBOT_POLONIEX_SECRET | default "YOUR-API-SECRET" | quote }}
// please note: poloniex does not support market orders via the API

// to enable Kraken trading, enter your API credentials:
c.kraken = {}
c.kraken.key = {{ .Values.env.ZENBOT_KRAKEN_API_KEY | default "YOUR-API-KEY" | quote }}
c.kraken.secret = {{ .Values.env.ZENBOT_KRAKEN_SECRET | default "YOUR-API-SECRET" | quote }}
// Please read API TOS on https://www.kraken.com/u/settings/api
c.kraken.tosagree = {{ .Values.env.ZENBOT_KRAKEN_TOS_AGREE | default "disagree" | quote }}

// to enable Binance trading, enter your API credentials:
c.binance = {}
c.binance.key = {{ .Values.env.ZENBOT_BINANCE_API_KEY | default "YOUR-API-KEY" | quote }}
c.binance.secret = {{ .Values.env.ZENBOT_BINANCE_SECRET | default "YOUR-API-SECRET" | quote }}

// to enable Binance US trading, enter your API credentials:
c.binanceus = {}
c.binanceus.key = 'YOUR-API-KEY'
c.binanceus.secret = 'YOUR-SECRET'

// to enable Bittrex trading, enter your API credentials:
c.bittrex = {}
c.bittrex.key = {{ .Values.env.ZENBOT_BITTREX_API_KEY | default "YOUR-API-KEY" | quote }}
c.bittrex.secret = {{ .Values.env.ZENBOT_BITTREX_SECRET | default "YOUR-API-SECRET" | quote }}
// make sure to give your API key access to only: "Trade Limit" and "Read Info",
// please note that this might change in the future.
// please note that bittrex API is limited, you cannot use backfills or sims (paper/live trading only)

// to enable Bitfinex trading, enter your API credentials:
c.bitfinex = {}
c.bitfinex.key = {{ .Values.env.ZENBOT_BITFINEX_API_KEY | default "YOUR-API-KEY" | quote }}
c.bitfinex.secret = {{ .Values.env.ZENBOT_BITFINEX_SECRET | default "YOUR-API-SECRET" | quote }}
// May use 'exchange' or 'margin' wallet balances
c.bitfinex.wallet = {{ .Values.env.ZENBOT_BITFINEX_WALLET | default "exchange" | quote }}

// to enable Bitstamp trading, enter your API credentials:
c.bitstamp = {}
c.bitstamp.key = {{ .Values.env.ZENBOT_BITSTAMP_API_KEY | default "YOUR-API-KEY" | quote }}
c.bitstamp.secret = {{ .Values.env.ZENBOT_BITSTAMP_SECRET | default "YOUR-API-SECRET" | quote }}
// A client ID is required on Bitstamp
c.bitstamp.client_id = {{ .Values.env.ZENBOT_BITSTAMP_CLIENT_ID| default "YOUR-CLIENT-ID" | quote }}

// to enable CEX.IO trading, enter your API credentials:
c.cexio = {}
c.cexio.username = {{ .Values.env.ZENBOT_CEXIO_CLIENT_ID| default "YOUR-CLIENT-ID" | quote }}
c.cexio.key = {{ .Values.env.ZENBOT_CEXIO_API_KEY | default "YOUR-API-KEY" | quote }}
c.cexio.secret = {{ .Values.env.ZENBOT_CEXIO_SECRET | default "YOUR-API-SECRET" | quote }}

// to enable QuadrigaCX tranding, enter your API credentials:
c.quadriga = {}
c.quadriga.key = {{ .Values.env.ZENBOT_QUADRIGA_API_KEY | default "YOUR-API-KEY" | quote }}
// this is the manual secret key entered by editing the API access
// and NOT the md5 hash you see in the summary
c.quadriga.secret = {{ .Values.env.ZENBOT_QUADRIGA_SECRET | default "YOUR-API-SECRET" | quote }}
// replace with the client id used at login, as a string, not number
c.quadriga.client_id = {{ .Values.env.ZENBOT_QUADRIGA_CLIENT_ID| default "YOUR-CLIENT-ID" | quote }}

// to enable WEX.NZ trading, enter your API credentials:
// Note: WexNZ only supports backfilling the last ~1/4 day ATM.
c.wexnz = {}
c.wexnz.key = {{ .Values.env.ZENBOT_WEXNZ_API_KEY | default "YOUR-API-KEY" | quote }}
c.wexnz.secret = {{ .Values.env.ZENBOT_WEXNZ_SECRET | default "YOUR-API-SECRET" | quote }}

// to enable Gemini trading, enter your API credentials:
c.gemini = {}
c.gemini.key = {{ .Values.env.ZENBOT_GEMINI_API_KEY | default "YOUR-API-KEY" | quote }}
c.gemini.secret = {{ .Values.env.ZENBOT_GEMINI_SECRET | default "YOUR-API-SECRET" | quote }}
// set to false to trade on the live platform API
c.gemini.sandbox = {{ .Values.env.ZENBOT_GEMINI_SANDBOX| default "true" }}

// to enable hitBTC trading, enter your API credentials:
c.hitbtc = {}
c.hitbtc.key = {{ .Values.env.ZENBOT_HITBTC_API_KEY | default "YOUR-API-KEY" | quote }}
c.hitbtc.secret = {{ .Values.env.ZENBOT_HITBTC_SECRET | default "YOUR-API-SECRET" | quote }}

// to enable therock trading, enter your API credentials:
c.therock = {}
c.therock.key = {{ .Values.env.ZENBOT_THEROCK_API_KEY | default "YOUR-API-KEY" | quote }}
c.therock.secret = {{ .Values.env.ZENBOT_THEROCK_SECRET | default "YOUR-API-SECRET" | quote }}

// Optional stop-order triggers:

// sell if price drops below this % of bought price (0 to disable)
c.sell_stop_pct = {{ .Values.env.ZENBOT_SELL_STOP_PCT| default "0" }}
// buy if price surges above this % of sold price (0 to disable)
c.buy_stop_pct = {{ .Values.env.ZENBOT_BUY_STOP_PCT| default "0" }}
// enable trailing sell stop when reaching this % profit (0 to disable)
c.profit_stop_enable_pct = {{ .Values.env.ZENBOT_PROFIT_STOP_ENABLE_PCT| default "0" }}
// maintain a trailing stop this % below the high-water mark of profit
c.profit_stop_pct = {{ .Values.env.ZENBOT_PROFIT_STOP_PCT | default "1" }}

// Order execution rules:

// avoid trading at a slippage above this pct
c.max_slippage_pct = {{ .Values.env.ZENBOT_MAX_SLIPPAGE_PCT | default "5" }}
// buy with this % of currency balance (WARNING : sim won't work properly if you set this value to 100)
c.buy_pct = {{ .Values.env.ZENBOT_BUY_PCT | default "99" }}
// sell with this % of asset balance (WARNING : sim won't work properly if you set this value to 100)
c.sell_pct = {{ .Values.env.ZENBOT_SELL_PCT | default "99" }}
// ms to adjust non-filled order after
c.order_adjust_time = {{ .Values.env.ZENBOT_ORDER_ADJUST_TIME | default "5000" }}
// avoid selling at a loss below this pct set to 0 to ensure selling at a higher price...
c.max_sell_loss_pct = {{ .Values.env.ZENBOT_MAX_SELL_LOSS_PCT | default "99" }}
// avoid buying at a loss above this pct set to 0 to ensure buying at a lower price...
c.max_buy_loss_pct = {{ .Values.env.ZENBOT_MAX_BUY_LOSS_PCT | default "99" }}
// ms to poll order status
c.order_poll_time = {{ .Values.env.ZENBOT_ORDER_POLL_TIME | default "5000" }}
// ms to wait for settlement (after an order cancel)
c.wait_for_settlement = {{ .Values.env.ZENBOT_WAIT_FOR_SETTLEMENT | default "5000" }}
// % to mark down buy price for orders
c.markdown_buy_pct = {{ .Values.env.ZENBOT_MARKDOWN_BUY_PCT| default "0" }}
// % to mark up sell price for orders
c.markup_sell_pct = {{ .Values.env.ZENBOT_MARKUP_SELL_PCT| default "0" }}
// become a market taker (high fees) or a market maker (low fees)
c.order_type = {{ .Values.env.ZENBOT_ORDER_TYPE | default "maker" | quote }}
// when supported by the exchange, use post only type orders.
c.post_only = {{ .Values.env.ZENBOT_POST_ONLY| default "true" }}
// use separated fee currency such as binance's BNB.
c.use_fee_asset = {{ .Values.env.ZENBOT_USE_FEE_ASSET| default "false" }}

// Misc options:

// default # days for backfill and sim commands
c.days = {{ .Values.env.ZENBOT_DAYS | default "14" }}
// defaults to a high number of lookback periods
c.keep_lookback_periods = {{ .Values.env.ZENBOT_KEEP_LOOKBACK_PERIODS | default "50000" }}
// ms to poll new trades at
c.poll_trades = {{ .Values.env.ZENBOT_POLL_TRADES | default "30000" }}
// amount of currency to start simulations with
c.currency_capital = {{ .Values.env.ZENBOT_CURRENCY_CAPITAL | default "1000" }}
// amount of asset to start simulations with
c.asset_capital = {{ .Values.env.ZENBOT_ASSET_CAPITAL| default "0" }}
// for sim, reverse time at the end of the graph, normalizing buy/hold to 0
c.symmetrical = {{ .Values.env.ZENBOT_SYMMETRICAL| default "false" }}
// number of periods to calculate RSI at
c.rsi_periods = {{ .Values.env.ZENBOT_RSI_PERIODS | default "14" }}
// period to record balances for stats
c.balance_snapshot_period = {{ .Values.env.ZENBOT_BALANCE_SNAPSHOT_PERIOD | default "15m" | quote }}
// avg. amount of slippage to apply to sim trades
c.avg_slippage_pct = {{ .Values.env.ZENBOT_AVG_SLIPPAGE_PCT| default "0.045" }}
// time to leave an order open, default to 1 day (this feature is not supported on all exchanges, currently: GDAX)
c.cancel_after = {{ .Values.env.ZENBOT_CANCEL_AFTER | default "day" | quote }}
// load and use previous trades for stop-order triggers and loss protection (live/paper mode only)
c.use_prev_trades = {{ .Values.env.ZENBOT_USE_PREV_TRADES| default "false" }}
// minimum number of previous trades to load if use_prev_trades is enabled, set to 0 to disable and use trade time instead
c.min_prev_trades = {{ .Values.env.ZENBOT_MIN_PREV_TRADES| default "0" }}

// Notifiers:
c.notifiers = {}

//common

c.notifiers.only_completed_trades = {{ .Values.env.ZENBOT_NOTIFY_ONLY_COMPLETED_TRADES| default "false" }} // Filter to notifier's messages for getting Commpleted Trades info.

// xmpp config
c.notifiers.xmpp = {}
c.notifiers.xmpp.on = {{ .Values.env.ZENBOT_XMPP_ENABLE| default "false" }}  // false xmpp disabled; true xmpp enabled (credentials should be correct)
c.notifiers.xmpp.jid = {{ .Values.env.ZENBOT_XMPP_JID | default "trader@domain.com" | quote }}
c.notifiers.xmpp.password = {{ .Values.env.ZENBOT_XMPP_PASSWORD | quote }}
c.notifiers.xmpp.host = {{ .Values.env.ZENBOT_XMPP_HOST | default "domain.com" | quote }}
c.notifiers.xmpp.port = {{ .Values.env.ZENBOT_XMPP_PORT | default "5222" }}
c.notifiers.xmpp.to = {{ .Values.env.ZENBOT_XMPP_TO | default "MeMyselfAndI@domain.com" | quote }}
// end xmpp configs

// pushbullets configs
c.notifiers.pushbullet = {}
c.notifiers.pushbullet.on = {{ .Values.env.ZENBOT_PUSHBULLET_ENABLE| default "false" }} // false pushbullets disabled; true pushbullets enabled (key should be correct)
c.notifiers.pushbullet.key = {{ .Values.env.ZENBOT_PUSHBULLET_API_KEY | quote }}
c.notifiers.pushbullet.deviceID = {{ .Values.env.ZENBOT_PUSHBULLET_DEVICE_ID | quote }}
// end pushbullets configs

// ifttt configs
c.notifiers.ifttt = {}
c.notifiers.ifttt.on = {{ .Values.env.ZENBOT_IFTTT_ENABLE| default "false" }} // false ifttt disabled; true ifttt enabled (key should be correct)
c.notifiers.ifttt.makerKey = {{ .Values.env.ZENBOT_IFTTT_API_KEY | quote }}
c.notifiers.ifttt.eventName = {{ .Values.env.ZENBOT_IFTTT_EVENT_NAME | default "zenbot" | quote }}
// end ifttt configs

// slack config
c.notifiers.slack = {}
c.notifiers.slack.on = {{ .Values.env.ZENBOT_SLACK_ENABLE| default "false" }}
c.notifiers.slack.webhook_url = {{ .Values.env.ZENBOT_SLACK_WEBHOOK_URL | quote }}
// end slack config

// ADAMANT Messenger config
c.notifiers.adamant = {}
c.notifiers.adamant.on = {{ .Values.env.ZENBOT_ADAMANT_ENABLE| default "false" }}
c.notifiers.adamant.nodes = typeof process.env.ZENBOT_ADAMANT_NODES !== 'undefined' ? process.env.ZENBOT_ADAMANT_NODES.split(',') : [
  'https://endless.adamant.im',
  'https://clown.adamant.im',
  'https://bid.adamant.im',
  'https://unusual.adamant.im',
  'https://debate.adamant.im',
  'http://185.231.245.26:36666',
  'https://lake.adamant.im',
  'http://localhost:36666'
]
c.notifiers.adamant.fromPassphrase = {{ .Values.env.ZENBOT_ADAMANT_FROM_PASSPHRASE | quote }}
c.notifiers.adamant.toAddresses = typeof process.env.ZENBOT_ADAMANT_TO_ADDRESSES !== 'undefined' ? process.env.ZENBOT_ADAMANT_TO_ADDRESSES.split(',') : ['']
// end ADAMANT Messenger config

// discord configs
c.notifiers.discord = {}
c.notifiers.discord.on = {{ .Values.env.ZENBOT_DISCORD_ENABLE| default "false" }} // false discord disabled; true discord enabled (key should be correct)
c.notifiers.discord.id = {{ .Values.env.ZENBOT_DISCORD_ID | quote }}
c.notifiers.discord.token = {{ .Values.env.ZENBOT_DISCORD_TOKEN | quote }}
c.notifiers.discord.username = {{ .Values.env.ZENBOT_DISCORD_USERNAME | default "Zenbot" | quote }}
c.notifiers.discord.avatar_url = {{ .Values.env.ZENBOT_DISCORD_AVATAR_URL | quote }}
c.notifiers.discord.color = {{ .Values.env.ZENBOT_DISCORD_COLOR | default "null" }} // color as a decimal
// end discord configs

// prowl configs
c.notifiers.prowl = {}
c.notifiers.prowl.on = {{ .Values.env.ZENBOT_PROWL_ENABLE| default "false" }} // false prowl disabled; true prowl enabled (key should be correct)
c.notifiers.prowl.key = process.env.ZENBOT_PROWL_KEY
// end prowl configs

// textbelt configs
c.notifiers.textbelt = {}
c.notifiers.textbelt.on = {{ .Values.env.ZENBOT_TEXTBELT_ENABLE| default "false" }} // false textbelt disabled; true textbelt enabled (key should be correct)
c.notifiers.textbelt.phone = process.env.ZENBOT_TEXTBELT_PHONE
c.notifiers.textbelt.key = process.env.ZENBOT_TEXTBELT_KEY
// end textbelt configs

// pushover configs
c.notifiers.pushover = {}
c.notifiers.pushover.on = {{ .Values.env.ZENBOT_PUSHOVER_ENABLE| default "false" }} // false pushover disabled; true pushover enabled (keys should be correct)
c.notifiers.pushover.token = process.env.ZENBOT_PUSHOVER_TOKEN // create application and supply the token here
c.notifiers.pushover.user = process.env.ZENBOT_PUSHOVER_USER_KEY // this is your own user's key (not application related)
c.notifiers.pushover.priority = {{ .Values.env.ZENBOT_PUSHOVER_PRIORITY | default "0" | quote }} // choose a priority to send zenbot messages with, see https://pushover.net/api#priority
// end pushover configs

// telegram configs
c.notifiers.telegram = {}
c.notifiers.telegram.on = {{ .Values.env.ZENBOT_TELEGRAM_ENABLE| default "false" }} // false telegram disabled; true telegram enabled (key should be correct)
c.notifiers.telegram.interactive = {{ .Values.env.ZENBOT_TELEGRAM_INTERACTIVE| default "false" }} // true telegram is interactive
c.notifiers.telegram.bot_token = process.env.ZENBOT_TELEGRAM_BOT_TOKEN
c.notifiers.telegram.chat_id = process.env.ZENBOT_TELEGRAM_CHAT_ID // the id of the chat the messages should be send in
// end telegram configs

// output
c.output = {}

// REST API
c.output.api = {}
c.output.api.on = {{ .Values.env.ZENBOT_API_ENABLE| default "true" }}
c.output.api.ip = {{ .Values.env.ZENBOT_API_IP | default "0.0.0.0" | quote }} // IPv4 or IPv6 address to listen on, uses all available interfaces if omitted
c.output.api.port = {{ .Values.env.ZENBOT_API_PORT | default "17365" }}
