var path = require('path')

module.exports = {
  watcher_poll_selectors: 10000,
  watcher_error_backoff: 30000,
  watcher_poll_new: 10000,
  backfill_days: 90,
  request_timeout: 10000,
  backfill_min_gap: 600000,
  default_strategy: path.resolve(__dirname, 'strategies', 'incremental_speculation.js'),
  lookback_size: 200
}