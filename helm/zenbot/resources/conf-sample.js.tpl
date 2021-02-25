var c = module.exports = {}

c.mongo = {}
c.mongo.db = {{ .Values.mongodb.auth.database | quote }}
c.mongo.host = '{{ template "zenbot.fullname" . }}-mongodb'
c.mongo.port = 27017
c.mongo.username = {{ .Values.mongodb.auth.username | quote }}
c.mongo.password = {{ .Values.mongodb.auth.password | quote }}
c.mongo.replicaSet = null
c.mongo.authMechanism = null

c.selector = {{ .Values.config.selector | quote }}
c.strategy = {{ .Values.config.strategy | quote }}

c.gdax = {}
c.gdax.key = {{ .Values.config.gdax.key | quote }}
c.gdax.b64secret = {{ .Values.config.gdax.b64secret | quote }}
c.gdax.passphrase = {{ .Values.config.gdax.passphrase | quote }}
c.gdax.apiURI = {{ .Values.config.gdax.apiURI | quote }}
c.gdax.websocketURI = {{ .Values.config.gdax.websocketURI | quote }}
c.gdax.sandbox = {{ .Values.config.gdax.sandbox }}

c.poloniex = {}
c.poloniex.key = {{ .Values.config.poloniex.key | quote }}
c.poloniex.secret = {{ .Values.config.poloniex.secret | quote }}

c.kraken = {}
c.kraken.key = {{ .Values.config.kraken.key | quote }}
c.kraken.secret = {{ .Values.config.kraken.secret | quote }}
c.kraken.tosagree = {{ .Values.config.kraken.tosagree | quote }}

c.binance = {}
c.binance.key = {{ .Values.config.binance.key | quote }}
c.binance.secret = {{ .Values.config.binance.secret | quote }}

c.binanceus = {}
c.binanceus.key = {{ .Values.config.binanceus.key | quote }}
c.binanceus.secret = {{ .Values.config.binanceus.secret | quote }}

c.bittrex = {}
c.bittrex.key = {{ .Values.config.bittrex.key | quote }}
c.bittrex.secret = {{ .Values.config.bittrex.secret | quote }}

c.bitfinex = {}
c.bitfinex.key = {{ .Values.config.bitfinex.key | quote }}
c.bitfinex.secret = {{ .Values.config.bitfinex.secret | quote }}
c.bitfinex.wallet = {{ .Values.config.bitfinex.wallet | quote }}

c.bitstamp = {}
c.bitstamp.key = {{ .Values.config.bitstamp.key | quote }}
c.bitstamp.secret = {{ .Values.config.bitstamp.secret | quote }}
c.bitstamp.client_id = {{ .Values.config.bitstamp.client_id | quote }}

c.cexio = {}
c.cexio.username = {{ .Values.config.cexio.username | quote }}
c.cexio.key = {{ .Values.config.cexio.key | quote }}
c.cexio.secret = {{ .Values.config.cexio.secret | quote }}

c.gemini = {}
c.gemini.key = {{ .Values.config.gemini.key | quote }}
c.gemini.secret = {{ .Values.config.gemini.secret | quote }}
c.gemini.sandbox = {{ .Values.config.gemini.sandbox }}

c.hitbtc = {}
c.hitbtc.key = {{ .Values.config.hitbtc.key | quote }}
c.hitbtc.secret = {{ .Values.config.hitbtc.secret | quote }}

c.therock = {}
c.therock.key = {{ .Values.config.therock.key | quote }}
c.therock.secret = {{ .Values.config.therock.secret | quote }}

c.sell_stop_pct = {{ .Values.config.sell_stop_pct }}
c.buy_stop_pct = {{ .Values.config.buy_stop_pct }}
c.profit_stop_enable_pct = {{ .Values.config.profit_stop_enable_pct }}
c.profit_stop_pct = {{ .Values.config.profit_stop_pct }}

c.max_slippage_pct = {{ .Values.config.max_slippage_pct }}
c.buy_pct = {{ .Values.config.buy_pct }}
c.sell_pct = {{ .Values.config.sell_pct }}
c.order_adjust_time = {{ .Values.config.order_adjust_time }}
c.max_sell_loss_pct = {{ .Values.config.max_sell_loss_pct }}
c.max_buy_loss_pct = {{ .Values.config.max_buy_loss_pct }}
c.order_poll_time = {{ .Values.config.order_poll_time }}
c.wait_for_settlement = {{ .Values.config.wait_for_settlement }}
c.markdown_buy_pct = {{ .Values.config.markdown_buy_pct }}
c.markup_sell_pct = {{ .Values.config.markup_sell_pct }}
c.order_type = {{ .Values.config.order_type | quote }}
c.post_only = {{ .Values.config.post_only }}
c.use_fee_asset = {{ .Values.config.use_fee_asset }}

c.days = {{ .Values.config.days }}
c.keep_lookback_periods = {{ .Values.config.keep_lookback_periods }}
c.poll_trades = {{ .Values.config.poll_trades }}
c.currency_capital = {{ .Values.config.currency_capital }}
c.asset_capital = {{ .Values.config.asset_capital }}
c.symmetrical = {{ .Values.config.symmetrical }}
c.rsi_periods = {{ .Values.config.rsi_periods }}
c.balance_snapshot_period = {{ .Values.config.balance_snapshot_period | quote }}
c.avg_slippage_pct = {{ .Values.config.avg_slippage_pct }}
c.cancel_after = {{ .Values.config.cancel_after | quote }}
c.use_prev_trades = {{ .Values.config.use_prev_trades }}
c.min_prev_trades = {{ .Values.config.min_prev_trades }}

// Notifiers:
c.notifiers = {}

c.notifiers.only_completed_trades = {{ .Values.config.notifiers.only_completed_trades }}

c.notifiers.xmpp = {}
c.notifiers.xmpp.on = {{ .Values.config.notifiers.xmpp.enabled }}
c.notifiers.xmpp.jid = {{ .Values.config.notifiers.xmpp.jid | quote }}
c.notifiers.xmpp.password = {{ .Values.config.notifiers.xmpp.password | quote }}
c.notifiers.xmpp.host = {{ .Values.config.notifiers.xmpp.host | quote }}
c.notifiers.xmpp.port = {{ .Values.config.notifiers.xmpp.port }}
c.notifiers.xmpp.to = {{ .Values.config.notifiers.xmpp.to | quote }}

c.notifiers.pushbullet = {}
c.notifiers.pushbullet.on = {{ .Values.config.notifiers.pushbullet.enabled }}
c.notifiers.pushbullet.key = {{ .Values.config.notifiers.pushbullet.key | quote }}
c.notifiers.pushbullet.deviceID = {{ .Values.config.notifiers.pushbullet.deviceID | quote }}

c.notifiers.ifttt = {}
c.notifiers.ifttt.on = {{ .Values.config.notifiers.ifttt.enabled }}
c.notifiers.ifttt.makerKey = {{ .Values.config.notifiers.ifttt.makerKey | quote }}
c.notifiers.ifttt.eventName = {{ .Values.config.notifiers.ifttt.eventName | quote }}

c.notifiers.slack = {}
c.notifiers.slack.on = {{ .Values.config.notifiers.slack.enabled }}
c.notifiers.slack.webhook_url = {{ .Values.config.notifiers.slack.webhook_url | quote }}

c.notifiers.adamant = {}
c.notifiers.adamant.on = {{ .Values.config.notifiers.adamant.enabled }}
c.notifiers.adamant.nodes = [
{{- range .Values.config.notifiers.adamant.nodes }}
{{ . | quote | indent 2 }},
{{- end }}
]
c.notifiers.adamant.fromPassphrase = {{ .Values.config.notifiers.adamant.fromPassphrase | quote }}
c.notifiers.adamant.toAddresses = [
{{- range .Values.config.notifiers.adamant.toAddresses }}
{{ . | quote | indent 2 }},
{{- end }}
]

c.notifiers.discord = {}
c.notifiers.discord.on = {{ .Values.config.notifiers.discord.enabled }}
c.notifiers.discord.id = {{ .Values.config.notifiers.discord.id | quote }}
c.notifiers.discord.token = {{ .Values.config.notifiers.discord.token | quote }}
c.notifiers.discord.username = {{ .Values.config.notifiers.discord.username | quote }}
c.notifiers.discord.avatar_url = {{ .Values.config.notifiers.discord.avatar_url | quote }}
c.notifiers.discord.color = {{ .Values.config.notifiers.discord.color }}

c.notifiers.prowl = {}
c.notifiers.prowl.on = {{ .Values.config.notifiers.prowl.enabled }}
c.notifiers.prowl.key = {{ .Values.config.notifiers.prowl.key | quote }}

c.notifiers.textbelt = {}
c.notifiers.textbelt.on = {{ .Values.config.notifiers.textbelt.enabled }}
c.notifiers.textbelt.phone = {{ .Values.config.notifiers.textbelt.phone|quote }}
c.notifiers.textbelt.key = {{ .Values.config.notifiers.textbelt.key| quote }}

c.notifiers.pushover = {}
c.notifiers.pushover.on = {{ .Values.config.notifiers.pushover.enabled }}
c.notifiers.pushover.token = {{ .Values.config.notifiers.pushover.token| quote }}
c.notifiers.pushover.user = {{ .Values.config.notifiers.pushover.user| quote }}
c.notifiers.pushover.priority = {{ .Values.config.notifiers.pushover.priority | quote }}

c.notifiers.telegram = {}
c.notifiers.telegram.on = {{ .Values.config.notifiers.telegram.enabled }}
c.notifiers.telegram.interactive = {{ .Values.config.notifiers.telegram.interactive }}
c.notifiers.telegram.bot_token = {{ .Values.config.notifiers.textbelt.key| quote }}
c.notifiers.telegram.chat_id = {{ .Values.config.notifiers.textbelt.key| quote }}

// output
c.output = {}

// REST API
c.output.api = {}
c.output.api.on = {{ .Values.config.output.api.enabled }}
c.output.api.ip = {{ .Values.config.output.api.ip | quote }}
c.output.api.port = {{ .Values.config.output.api.port }}
