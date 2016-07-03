var n = require('numeral')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  var min_time = bot.start || new Date().getTime() - (86400000 * 90) // 90 days ago
  var brain = get('bot.brain')
  var start = brain.run_state.currency
  function getNext () {
    var params = {
      query: {
        time: {
          $gt: min_time
        }
      },
      sort: {
        time: 1
      },
      limit: constants.query_limit
    }
    get('db.ticks').select(params, function (err, ticks) {
      if (err) {
        get('console').error('tick select err', err)
        return setImmediate(getNext)
      }
      if (!ticks.length) {
        var balance = brain.end()
        var currency = n(balance.currency).format('$0,0.00').yellow
        get('console').log('ended simulation with', currency, 'USD', 'BTC')
        balance.roi = n(1)
          .add(
            n(balance.currency)
              .subtract(start.currency)
              .divide(start.currency)
          )
          .value()
        console.log(JSON.stringify(balance, null, 2))
        setTimeout(process.exit, 1000)
        return
      }
      ticks.forEach(function (tick) {
        brain.write(tick)
        min_time = tick.time
      })
      brain.report()
      setImmediate(getNext)
    })
  }
  setImmediate(getNext)
  return null
}