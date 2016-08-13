var request = require('micro-request')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var map = get('map')
  var get_id = get('utils.get_id')
  var get_tick_str = get('utils.get_tick_str')
  var c = get('config')
  var get_timestamp = get('utils.get_timestamp')
  var z = get('utils.zero_fill')
  return function mapper () {
    var options = get('options')
    if (!options.backfill_rsi) return
    var min_time, num_marked = 0
    function getNext () {
      var params = {
        query: {
          app: get('app_name'),
          size: {
            $in: c.rsi_sizes
          },
          'data.trades': {
            $exists: true
          }
        },
        sort: {
          time: -1
        },
        limit: 100
      }
      if (min_time) {
        params.query.time = {
          $lt: min_time
        }
      }
      get('ticks').select(params, function (err, ticks) {
        if (err) throw err
        ticks.forEach(function (tick) {
          min_time = min_time ? Math.min(tick.time, min_time) : tick.time
          tick.tick_id = tick.id
          tick.id = get_id()
          map('rsi_backfill', tick)
          num_marked++
          //get('logger').info('RSI', 'backfill map'.grey, z(12, get_tick_str(tick.tick_id)), get_timestamp(tick.time).grey)
        })
        if (ticks.length) {
          setImmediate(getNext)
        }
        else {
          get('logger').info('RSI', 'marked'.grey, num_marked, 'ticks for RSI backfill'.grey)
          get('app').close(function () {
            process.exit()
          })
        }
      })
    }
    getNext()
  }
}
