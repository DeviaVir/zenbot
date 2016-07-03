var constants = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var maxTime = new Date().getTime()
  var brain = get('bot.brain')
  function getNext () {
    var params = {
      query: {
        time: {
          $gt: maxTime
        }
      },
      sort: {
        time: 1
      },
      limit: sim.query_limit
    }
    get('db.ticks').select(params, function (err, ticks) {
      if (err) throw err
      if (ticks.length) {
        ticks.forEach(function (tick) {
          brain.write(tick)
          maxTime = Math.max(tick.time, maxTime)
        })
        brain.report()
      }
      setTimeout(getNext, constants.tick_ms)
    })
  }
  setImmediate(getNext)
  return null
}