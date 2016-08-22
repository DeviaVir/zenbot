var n = require('numbro')
  , colors = require('colors')
  , parallel = require('run-parallel')
  , tb = require('timebucket')
  , o = require('object-get')

module.exports = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  var get_timestamp = get('utils.get_timestamp')
  var z = get('utils.zero_fill')
  return function tick_reducer (g, cb) {
    var c = get('config')
    var options = get('options')
    var tick = g.tick, sub_tick = g.sub_tick
    // only process specific tick sizes
    if (c.sma_sizes.indexOf(tick.size) === -1) return cb()
    //console.error('computing SMA', tick.id)
    var bucket = tb(tick.time).resize(tick.size)
    var d = tick.data.trades
    get('ticks').select({
      query: {
        app: get('app_name'),
        size: tick.size,
        time: {
          $lt: bucket.toMilliseconds()
        }
      },
      limit: c.sma_query_limit,
      sort: {
        time: -1
      }
    }, function (err, lookback) {
      if (err) return cb(err)
      withLookback(lookback.reverse())
    })
    function withLookback (lookback) {
      var computations = 0
      Object.keys(d).forEach(function (e) {
        Object.keys(d[e]).forEach(function (pair) {
          var de = d[e][pair]
          de['sma'] || (de['sma'] = {})
          var r = de['sma']
          r.ansi = ''
          var close_lookback = lookback.filter(function (tick) {
            return !!o(tick, 'data.trades.' + e + '.' + pair)
          }).map(function (tick) {
            return o(tick, 'data.trades.' + e + '.' + pair + '.close')
          })
          if (close_lookback.length > c.sma_periods - 1) {
            close_lookback = close_lookback.slice(close_lookback.length - c.sma_periods + 1)
          }
          r.samples = close_lookback.length
          r.last_close = o(tick, 'data.trades.' + e + '.' + pair + '.close')
          if (!r.last_close) return
          r.sum = close_lookback.reduce(function (prev, curr) {
            return prev + curr
          }, r.last_close)
          r.value = n(r.sum).divide(close_lookback.length + 1).value()
          r.samples++
          r.close_lookback = close_lookback
        })
      })
      cb()
    }
  }
}
