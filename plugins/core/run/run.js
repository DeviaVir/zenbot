module.exports = function container (get, set, clear) {
  var c = get('constants')
  var series = get('motley:vendor.run-series')
  return function run (options) {
    var rs = get('run_state')
    var brain = get('brain')
    rs.max_times = {}
    var start_time = new Date().getTime()
    c.tick_sizes.forEach(function (tick_size) {
      rs.max_times[tick_size] = start_time
      ;(function getNext () {
        var params = {
          query: {
            complete: true,
            seen: false,
            size: tick_size,
            time: {
              $gte: start_time
            }
          },
          sort: {
            time: 1
          }
        }
        get('motley:db.ticks').select(params, function (err, ticks) {
          if (err) throw err
          if (ticks.length) {
            var tasks = ticks.map(function (tick) {
              return function task (done) {
                rs.max_times[tick_size] = Math.max(tick.min_time, rs.max_times[tick_size])
                brain.see(tick, function (err) {
                  if (err) return done(err)
                  tick.seen = true
                  get('motley:db.ticks').save(tick, done)
                })
              }
            })
            series(tasks, function (err) {
              brain.think(function (err) {
                if (err) {
                  get('logger').error('think err', err)
                }
                var timeout = setTimeout(getNext, c.tick)
                set('timeouts[]', timeout)
              })
            })
          }
          else {
            var timeout = setTimeout(getNext, c.tick)
            set('timeouts[]', timeout)
          }
        })
      })()
    })
  }
}