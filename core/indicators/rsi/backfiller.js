var request = require('micro-request')
  , n = require('numbro')
  , sig = require('sig')

module.exports = function container (get, set, clear) {
  var map = get('map')
  var get_id = get('utils.get_id')
  var get_tick_str = get('utils.get_tick_str')
  var c = get('config')
  var get_timestamp = get('utils.get_timestamp')
  var z = get('utils.zero_fill')
  var sigs = []
  return function mapper () {
    var options = get('options')
    if (!options.backfill) return
    var min_time, num_marked = 0
    function getNext () {
      var params = {
        query: {
          app: get('app_name'),
          size: {
            $in: c.rsi_sizes
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
          if (tick.data.trades) {
            var tick_sig = sig(tick)
            if (sigs.indexOf(tick_sig) !== -1) {
              return
            }
            sigs.push(tick_sig)
            map('rsi_backfill', {time: tick.time})
            num_marked++
          }
          //get('logger').info('RSI', 'backfill map'.grey, z(12, get_tick_str(tick.tick_id)), get_timestamp(tick.time).grey)
        })
        if (ticks.length) {
          setImmediate(getNext)
        }
        else {
          get('logger').info('RSI', 'marked'.grey, num_marked, c.rsi_sizes.join(',') + ' ticks for RSI backfill'.grey)
          setTimeout(mapper, c.rsi_backfill_timeout)
        }
      })
    }
    getNext()
  }
}
