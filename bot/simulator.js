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
    var start = get('conf.bot').balance
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
          var balance = brain.end()
          get('console').log('ended simulation with', numeral(balance.currency).format('$0,0.00').yellow, 'USD', numeral(balance.asset).format('0.000').white, 'BTC')
          if (balance.close && start.currency) {
            balance.roi = 1 + (balance.currency - start.currency) / start.currency
          }
          else if (balance.close && start.asset) {
            balance.asset += balance.currency / balance.close
            balance.currency = 0
            balance.roi = 1 + (balance.asset - start.asset) / start.asset
          }
          else {
            balance.roi = 1
          }
          console.log(JSON.stringify(balance))
          setTimeout(process.exit, 1000)
          return
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