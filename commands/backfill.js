var tb = require('timebucket')
  , idgen = require('idgen')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('backfill <selector>')
      .description('download historical trades for analysis')
      .option('-d, --days <days>', 'number of days to acquire (default: ' + c.backfill_days + ')', Number, c.backfill_days)
      .action(function (selector, cmd) {
        selector = get('lib.normalize-selector')(selector)
        get('lib.list-selectors')(function (err, selectors) {
          if (err) throw err
          if (selectors.indexOf(selector) === -1) {
            console.error('invalid selector: ' + selector)
            process.exit(1)
          }
          var exchange_id = selector.split('.')[0]
          var product_id = selector.split('.')[1]
          var exchange = get('exchanges.' + exchange_id)
          if (!exchange) {
            console.error('cannot watch ' + selector + ': exchange not implemented')
            process.exit(1)
          }
          var trades = get('db.trades')
          get('db.mongo').collection('trades').ensureIndex({time: 1})
          var resume_markers = get('db.resume_markers')
          get('db.mongo').collection('resume_markers').ensureIndex({selector: 1, to: -1})
          var marker = {
            id: idgen(),
            selector: selector,
            from: null,
            to: null,
            oldest_time: null
          }
          var saved = {}
          var trade_counter = 0
          var days_left = cmd.days + 1
          var target_time = new Date().getTime() - (86400000 * cmd.days)
          resume_markers.select({query: {selector: selector}, order: {to: -1}}, function (err, markers) {
            if (err) throw err
            getNext()
            function getNext () {
              var opts = {product_id: product_id, to: marker.from}
              exchange.getTrades(opts, function (err, trades) {
                if (err) {
                  console.error('err backfilling selector: ' + selector)
                  console.error(err)
                  if (err.code === 'ETIMEDOUT') {
                    console.error('retrying...')
                    setImmediate(getNext)
                    return
                  }
                  console.error('aborting!')
                  process.exit(1)
                }
                trades.sort(function (a, b) {
                  if (a.time > b.time) return -1
                  if (a.time < b.time) return 1
                  return 0
                })
                trades.forEach(function (trade) {
                  saveTrade(trade)
                })
                var oldest_time = marker.oldest_time
                markers.forEach(function (other_marker) {
                  // if the oldest_cursor is within another marker's range, skip to the other marker's start point.
                  if (marker.id !== other_marker.id && marker.from <= other_marker.to && marker.from > other_marker.from) {
                    marker.from = other_marker.from
                    marker.oldest_time = other_marker.oldest_time
                  }
                })
                if (oldest_time !== marker.oldest_time) {
                  var diff = tb(oldest_time - marker.oldest_time).resize('1h').value
                  console.log('\nskipping ' + diff + ' hrs of previously collected data')
                }
                resume_markers.save(marker, function (err) {
                  if (err) throw err
                  trade_counter += trades.length
                  var current_days_left = Math.ceil((marker.oldest_time - target_time) / 86400000)
                  if (current_days_left >= 0 && current_days_left != days_left) {
                    console.log('\n' + selector, 'saved', trade_counter, 'trades', current_days_left, 'days left')
                    trade_counter = 0
                    days_left = current_days_left
                  }
                  else {
                    process.stdout.write('.')
                  }
                  if (marker.oldest_time <= target_time) {
                    console.log('\ndownload complete!')
                    integrityCheck()
                    return
                  }
                  setImmediate(getNext)
                })
              })
            }
            function saveTrade (trade) {
              trade.id = selector + '-' + String(trade.trade_id)
              if (saved[trade.id]) {
                console.error('warning: already saved ' + trade.id)
              }
              trade.selector = selector
              var cursor = exchange.getCursor(trade)
              if (!marker.to) {
                marker.to = cursor
                marker.oldest_time = trade.time
                marker.newest_time = trade.time
              }
              marker.from = marker.from ? Math.min(marker.from, cursor) : cursor
              marker.oldest_time = marker.oldest_time ? Math.min(marker.oldest_time, trade.time) : trade.time
              trades.save(trade, function (err) {
                if (err) throw err
                saved[trade.id] = true
              })
            }
            function integrityCheck () {
              console.log('\nchecking for gaps...')
              console.log('data starts at ' + new Date(marker.oldest_time))
              var cursor = target_time
              var newest_time
              var last_id
              var trade_counter = 0
              function checkNext () {
                var opts = {query: {selector: selector, time: {$gte: cursor}}, order: {time: 1}, limit: 1000}
                get('db.trades').select(opts, function (err, trades) {
                  if (err) throw err
                  var is_complete = false
                  trades.forEach(function (trade) {
                    if (is_complete) {
                      return
                    }
                    trade_counter++
                    newest_time = trade.time
                    if (trade.trade_id == marker.to) {
                      is_complete = true
                    }
                    var diff = trade.time - cursor
                    if (diff > c.backfill_min_gap) {
                      console.error('\nwarning: ' + tb(diff).resize('1m').value + 'm gap between', 'txns', last_id + '-' + trade.trade_id, new Date(cursor) + ' to ' + new Date(trade.time))
                    }
                    cursor = trade.time
                    last_id = trade.trade_id
                  })
                  if (!trades.length) {
                    console.error('error: no trades found?')
                    process.exit(1)
                  }
                  if (is_complete) {
                    console.log('\nbackfilled ' + n(trade_counter).format('0,0') + ' ' + selector + ' trades from ' + new Date(marker.oldest_time) + ' to ' + new Date(newest_time))
                    var time_gap = newest_time - marker.oldest_time
                    var per_min = trade_counter / (time_gap / 60000)
                    console.log('trade avg speed: ' + n(per_min).format('0.00') + '/min')
                    console.log('check complete.\n')
                    process.exit(0)
                  }
                  setImmediate(checkNext)
                })
              }
              checkNext()
            }
          })
        })
      })
  }
}