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
    var minTime = sim.min_time || new Date().getTime() - (86400000 * 90) // 90 days ago
    var start = get('conf.bot').balance.currency
    var brain = get('bot.brain')()
    function getNext () {
      var params = {
        query: {
          time: {
            $gt: minTime
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
        if (!ticks.length) {
          var currency = brain.end()
          get('console').log('ended simulation with', numeral(currency).format('$0,0.00').yellow)
          var roi = 1 + (currency - start) / start
          console.log(JSON.stringify({roi: roi}))
          process.exit()
        }
        ticks.forEach(function (tick) {
          brain.write(tick)
          minTime = tick.time
        })
        brain.report()
        setImmediate(getNext)
      })
    }
    setImmediate(getNext)
  }
}