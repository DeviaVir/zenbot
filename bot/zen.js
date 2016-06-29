var numeral = require('numeral')

module.exports = function container (get, set, clear) {
  return function (options) {
    var sim = JSON.parse(JSON.stringify(options || {}))
    var conf = get('conf.sim')
    Object.keys(conf).forEach(function (k) {
      if (typeof sim[k] === 'undefined') {
        sim[k] = JSON.parse(JSON.stringify(conf[k]))
      }
    })
    var maxTime = new Date().getTime()
    var start = get('conf.bot').balance.currency
    var brain = get('bot.brain')(sim)
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
        if (err) {
          get('console').error('tick select err', err)
          return setImmediate(getNext)
        }
        if (ticks.length) {
          ticks.forEach(function (tick) {
            brain.write(tick)
            maxTime = Math.max(tick.time, maxTime)
          })
          brain.report()
        }
        setTimeout(getNext, get('conf.tick_interval'))
      })
    }
    setImmediate(getNext)
  }
}