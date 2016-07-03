var n = require('numeral')
  , constants = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  var min_time = bot.start || new Date().getTime() - (86400000 * 90) // 90 days ago
  var brain = get('bot.brain')
  var start = brain.run_state.currency
  var first_tick, last_tick
  function getNext () {
    var params = {
      query: {
        time: {
          $gt: n(min_time).value()
        }
      },
      sort: {
        time: 1
      },
      limit: constants.sim_query_limit
    }
    get('db.ticks').select(params, function (err, ticks) {
      if (err) {
        get('console').error('tick select err', err)
        return setImmediate(getNext)
      }
      if (!ticks.length) {
        if (!first_tick) {
          throw new Error('no ticks')
        }
        var result = {}
        var brain_result = brain.end()
        var balance = brain_result.balance
        result.open = first_tick.open
        result.close = last_tick.close
        result.open_time = first_tick.time
        result.close_time = last_tick.time
        var currency = n(balance).format('$0,0.00').yellow
        get('console').info('ended simulation with', currency, constants.currency)
        result.roi = n(1)
          .add(
            n(balance)
              .subtract(start)
              .divide(start)
          )
          .value()
        result.trade_vol = brain_result.trade_vol
        result.num_trades = brain_result.num_trades
        console.log(JSON.stringify(result, null, 2))
        setTimeout(process.exit, 1000)
        return
      }
      ticks.forEach(function (tick) {
        if (!first_tick) first_tick = tick
        brain.write(tick)
        min_time = tick.time
        last_tick = tick
      })
      brain.report()
      setImmediate(getNext)
    })
  }
  setImmediate(getNext)
  return null
}