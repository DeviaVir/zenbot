var c = module.exports = {}

// COMMONLY TWEAKED VARIABLES:

// name of default trade strategy. list available with `zenbot list-strategies` and override with (--strategy)
c.strategy = 'trend_ema_rate'
// sell if price drops below this % of bought price
c.sell_stop_pct = 6
// don't do sell stops below this % of bought price
c.sell_stop_max_pct = 8
// buy if price surges above this % of sold price
c.buy_stop_pct = 4
// enable trailing sell stop when reaching this % profit
c.profit_stop_enable_pct = 3
// maintain a trailing stop this % below the high-water mark of profit
c.profit_stop_pct = 3
// avoid selling at a loss below this pct (override with --max_sell_loss_pct)
c.max_sell_loss_pct = 25

// LESS-COMMONLY TWEAKED VARAIBLES:

// mongo configuration
c.mongo_host = 'localhost'
c.mongo_port = 27017
c.mongo_db = 'zenbot4'
c.mongo_username = null
c.mongo_password = null
// default # days for backfill command
c.backfill_days = 90
// fee assessed for market-type orders. (note: zenbot normally attempts to use limit-type orders to avoid fees)
c.fee_pct = 0.25
// # periods of history to keep active
c.lookback_size = 200
// ms to poll new trades at
c.poll_trades = 10000
// ms to allow http requests to complete
c.request_timeout = 10000
// ms to retry failed requests after
c.error_backoff = 30000
// amount of currency to start simulations with (normally overriden with --start_capital)
c.start_capital = 1000
// % to markup price for sell orders (normally overriden with --markup_pct)
c.markup_pct = 0
// ms to adjust non-filled order after
c.order_adjust_time = 30000
// for sim, reverse time at the end of the graph, normalizing buy/hold to 0
c.symmetrical = false
