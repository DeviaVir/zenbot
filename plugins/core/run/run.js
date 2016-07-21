module.exports = function container (get, set, clear) {
  var c = get('constants')
  return function run (options) {
    var rs = get('run_state')
    var brain = get('brain')
    rs.max_time = new Date().getTime()
    (function getNext () {
      var params = {
        query: {
          time: {
            $gte: rs.max_time
          }
        },
        sort: {
          time: 1
        }
      }
      get('db.ticks').select(params, function (err, ticks) {
        if (err) throw err
        if (ticks.length) {
          ticks.forEach(function (tick) {
            brain.write(tick)
            rs.max_time = Math.max(tick.time, rs.max_time)
          })
          brain.report()
        }
        var timeout = setTimeout(getNext, c.tick)
        set('timeouts[]', timeout)
      })
    })()
  }
}