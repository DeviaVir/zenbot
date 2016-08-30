module.exports = function (c) {
  c || (c = {})

  // graph server
  c.default_graph_period = "1h"
  c.default_graph_limit = 200
  c.graph_limits = [50, 100, 150, 200, 300, 500, 1000, 2000]
  c.log_query_limit = 200
  c.tracking_scripts = ''

  // SMA indicator config
  c.sma_sizes = ['1h']
  c.sma_reporter_size = '1h'
  c.sma_query_limit = 20
  c.sma_periods = 10

  c.ansi_graph_width = 20
  c.ansi_graph_decay = 0.01

  // reporter
  c.reporter_sizes = ['1m']
  c.price_reporter_length = 12
  c.reporter_cols = [
    "tick_id",
    "num_trades",
    "ansi_graph",
    "rsi",
    //"volume",
    "price",
    "eta",
    //"sma",
    "balance",
    "roi"
  ]
  c.trade_log = false
  c.reducer_report_interval = 30000
  c.trade_reducer_log = false
  c.trade_reducer_log_interval = 30000
  c.min_log_trades = 2

  // backfiller
  c.backfill_days = 91
  c.record_timeout = 20000
  c.backfill_timeout = 5000

  // simulator
  c.sim_input_unit = "7d"
  c.sim_input_limit = 12

  // zenbrain engine stuff
  c.bucket_size = "1m"
  c.reducer_limit = 1500 // how many thoughts to process per reduce run
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
  c.brain_speed_ms = 5000
  c.reducer_perf_report_min = 2
  c.reducer_perf_report_timeout = 30000
  return c
}
