var c = module.exports = {}

// COMMONLY TWEAKED VARIABLES:

// default selector. only used if omitting [selector] argument from a command.
c.selector = 'gdax.BTC-USD'
// name of default trade strategy
c.strategy = 'trend_ema'
// sell if price drops below this % of bought price (0 to disable)
c.sell_stop_pct = 0
// buy if price surges above this % of sold price (0 to disable)
c.buy_stop_pct = 0
// enable trailing sell stop when reaching this % profit (0 to disable. note: in extreme bull markets, turn this off for max profit!)
c.profit_stop_enable_pct = 10
// maintain a trailing stop this % below the high-water mark of profit
c.profit_stop_pct = 1
// avoid selling at a loss below this pct
c.max_sell_loss_pct = 25
// avoid trading at a slippage above this pct
c.max_slippage_pct = 5
// buy with this % of currency balance
c.buy_pct = 99
// sell with this % of asset balance
c.sell_pct = 99
// % to mark up or down price for orders
c.markup_pct = 0

// LESS-COMMONLY TWEAKED VARAIBLES:

// mongo configuration
c.mongo_host = 'localhost'
c.mongo_port = 27017
c.mongo_db = 'zenbot4'
c.mongo_username = null
c.mongo_password = null
// default # days for backfill and sim commands
c.days = 90
// ms to poll new trades at
c.poll_trades = 30000
// amount of currency to start simulations with
c.currency_capital = 1000
// amount of asset to start simulations with
c.asset_capital = 0
// ms to poll order status
c.order_poll_time = 5000
// ms to adjust non-filled order after
c.order_adjust_time = 30000
// for sim, reverse time at the end of the graph, normalizing buy/hold to 0
c.symmetrical = false
// number of periods to calculate RSI at
c.rsi_periods = 14
// ms to wait for settlement (after an order cancel)
c.wait_for_settlement = 5000
// ms to wait for settlement (after a funds on hold error)
c.wait_more_for_settlement = 60000
// period to record balances for stats
c.balance_snapshot_period = '1h'
