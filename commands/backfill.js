var tb = require('timebucket')
  , n = require('numbro')
  , parallel = require('run-parallel')
  , crypto = require('crypto')

module.exports = function container (get, set, clear) {
  var c = get('conf') || {}
  return function (program) {
    program
      .command('backfill [selector]')
      .description('download historical trades for analysis')
      .option('-d, --days <days>', 'number of days to acquire (default: ' + c.days + ')', Number, c.days)
      .action(function (selector, cmd) {
        selector = get('lib.normalize-selector')(selector || c.selector)
        var exchange_id = selector.split('.')[0]
        var product_id = selector.split('.')[1]
        var exchange = get('exchanges.' + exchange_id)
        if (!exchange) {
          console.error('cannot backfill ' + selector + ': exchange not implemented')
          process.exit(1)
        }
        var trades = get('db.trades')
        get('db.mongo').collection('trades').ensureIndex({selector: 1, time: 1})
        var resume_markers = get('db.resume_markers')
        get('db.mongo').collection('resume_markers').ensureIndex({selector: 1, to: -1})
        var marker = {
          id: crypto.randomBytes(4).toString('hex'),
          selector: selector,
          from: null,
          to: null,
          oldest_time: null,
          newest_time: null
        }
        var trade_counter = 0
        var day_trade_counter = 0
        var days_left = cmd.days + 1
        var target_time, start_time
        var mode = exchange.historyScan
        var last_batch_id, last_batch_opts
        if (!mode) {
          console.error('cannot backfill ' + selector + ': exchange does not offer historical data')
          process.exit(0)
        }
        if (mode === 'backward') {
          target_time = new Date().getTime() - (86400000 * cmd.days)
        }
        else {
          target_time = new Date().getTime()
          start_time = new Date().getTime() - (86400000 * cmd.days)
        }
        resume_markers.select({query: {selector: selector}}, function (err, markers) {
          if (err) throw err
          markers.sort(function (a, b) {
            if (mode === 'backward') {
              if (a.to > b.to) return -1
              if (a.to < b.to) return 1
            }
            else {
              if (a.from < b.from) return -1
              if (a.from > b.from) return 1
            }
            return 0
          })
          getNext()
          function getNext () {
            var opts = {product_id: product_id}
            if (mode === 'backward') {
              opts.to = marker.from
            }
            else {
              if (marker.to) opts.from = marker.to + 1
              else opts.from = exchange.getCursor(start_time)
            }
            last_batch_opts = opts
            exchange.getTrades(opts, function (err, trades) {
              if (err) {
                console.error('err backfilling selector: ' + selector)
                console.error(err)
                if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
                  console.error('retrying...')
                  setImmediate(getNext)
                  return
                }
                console.error('aborting!')
                process.exit(1)
              }
              if (mode !== 'backward' && !trades.length) {
                if (trade_counter) {
                  console.log('\ndownload complete!\n')
                  process.exit(0)
                }
                else {
                  console.error('\ngetTrades() returned no trades, --start may be too remotely in the past.')
                  process.exit(1)
                }
              }
              else if (!trades.length) {
                console.log('\ngetTrades() returned no trades, we may have exhausted the historical data range.')
                process.exit(0)
              }
              trades.sort(function (a, b) {
                if (mode === 'backward') {
                  if (a.time > b.time) return -1
                  if (a.time < b.time) return 1
                }
                else {
                  if (a.time < b.time) return -1
                  if (a.time > b.time) return 1
                }
                return 0
              })
              if (last_batch_id && last_batch_id === trades[0].trade_id) {
                console.error('\nerror: getTrades() returned duplicate results')
                console.error(opts)
                console.error(last_batch_opts)
                process.exit(0)
              }
              last_batch_id = trades[0].trade_id
              var tasks = trades.map(function (trade) {
                return function (cb) {
                  saveTrade(trade, cb)
                }
              })
              function runTasks () {
                parallel(tasks, function (err) {
                  if (err) {
                    console.error(err)
                    console.error('retrying...')
                    return setTimeout(runTasks, 10000)
                  }
                  var oldest_time = marker.oldest_time
                  var newest_time = marker.newest_time
                  markers.forEach(function (other_marker) {
                    // for backward scan, if the oldest_time is within another marker's range, skip to the other marker's start point.
                    // for forward scan, if the newest_time is within another marker's range, skip to the other marker's end point.
                    if (mode === 'backward' && marker.id !== other_marker.id && marker.from <= other_marker.to && marker.from > other_marker.from) {
                      marker.from = other_marker.from
                      marker.oldest_time = other_marker.oldest_time
                    }
                    else if (mode !== 'backward' && marker.id !== other_marker.id && marker.to >= other_marker.from && marker.to < other_marker.to) {
                      marker.to = other_marker.to
                      marker.newest_time = other_marker.newest_time
                    }
                  })
                  if (oldest_time !== marker.oldest_time) {
                    var diff = tb(oldest_time - marker.oldest_time).resize('1h').value
                    console.log('\nskipping ' + diff + ' hrs of previously collected data')
                  }
                  else if (newest_time !== marker.newest_time) {
                    var diff = tb(marker.newest_time - newest_time).resize('1h').value
                    console.log('\nskipping ' + diff + ' hrs of previously collected data')
                  }
                  resume_markers.save(marker, function (err) {
                    if (err) throw err
                    trade_counter += trades.length
                    day_trade_counter += trades.length
                    var current_days_left = Math.ceil((mode === 'backward' ? marker.oldest_time - target_time : target_time - marker.newest_time) / 86400000)
                    if (current_days_left >= 0 && current_days_left != days_left) {
                      console.log('\n' + selector, 'saved', day_trade_counter, 'trades', current_days_left, 'days left')
                      day_trade_counter = 0
                      days_left = current_days_left
                    }
                    else {
                      process.stdout.write('.')
                    }
                    if (mode === 'backward' && marker.oldest_time <= target_time) {
                      console.log('\ndownload complete!\n')
                      process.exit(0)
                    }
                    if (exchange.backfillRateLimit) {
                      setTimeout(getNext, exchange.backfillRateLimit)
                    } else {
                      setImmediate(getNext)
                    }
                  })
                })
              }
              runTasks()
            })
          }
          function saveTrade (trade, cb) {
            trade.id = selector + '-' + String(trade.trade_id)
            trade.selector = selector
            var cursor = exchange.getCursor(trade)
            if (mode === 'backward') {
              if (!marker.to) {
                marker.to = cursor
                marker.oldest_time = trade.time
                marker.newest_time = trade.time
              }
              marker.from = marker.from ? Math.min(marker.from, cursor) : cursor
              marker.oldest_time = Math.min(marker.oldest_time, trade.time)
            }
            else {
              if (!marker.from) {
                marker.from = cursor
                marker.oldest_time = trade.time
                marker.newest_time = trade.time
              }
              marker.to = marker.to ? Math.max(marker.to, cursor) : cursor
              marker.newest_time = Math.max(marker.newest_time, trade.time)
            }
            trades.save(trade, cb)
          }
        })
      })
  }
}
