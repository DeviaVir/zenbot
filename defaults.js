module.exports = {
  mongo_host: 'localhost',
  mongo_port: 27017,
  mongo_db: 'zenbot4',
  mongo_username: null,
  mongo_password: null,

  strategy: 'trend_ema_rate',
  watcher_error_backoff: 30000,
  watcher_poll_new: 10000,
  backfill_days: 90,
  request_timeout: 10000,
  lookback_size: 200,
  fee_pct: 0.25,
  start_capital: 1000,
  markup_pct: 0.01,
  markdown_pct: 0.01,
  bid_adjust_time: 300000,
  max_sell_loss_pct: -10
}