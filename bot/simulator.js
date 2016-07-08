var n = require('numbro')
  , constants = require('../conf/constants.json')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  var get_timestamp = get('utils.get_timestamp')
  var min_time = bot.start || tb('7d').subtract(12).toMilliseconds()
  var max_time = bot.end || tb(min_time).resize('7d').add(12).toMilliseconds()
  get('console').info(('[sim] start = ' + get_timestamp(min_time) + ', end = ' + get_timestamp(max_time)).cyan)
  var brain = get('bot.brain')
  var start = brain.run_state.currency
  var first_tick, last_tick

  if (bot.throttle) {
    var monitor = require('os-monitor')
    var pausing = false
    var pause_msg = ''
    monitor.start({
      critical1: bot.throttle,
      immediate: true,
      delay: 5000
    })
    monitor.on('monitor', function (event) {
      if (pausing && event.loadavg && event.loadavg[0] < bot.throttle) {
        get('console').info(('[resuming] load = ' + n(event.loadavg[0]).format('0.000')).yellow)
        pausing = false
      }
      else if (event.loadavg && event.loadavg[0] >= bot.throttle) {
        pause_msg = ('[paused] load = ' + n(event.loadavg[0]).format('0.000')).yellow
        pausing = true
      }
    })
  }

  function getNext () {
    if (bot.throttle && pausing) return setTimeout(getNext, 5000)
    var params = {
      query: {
        time: {
          $gt: n(min_time).value(),
          $lt: n(max_time).value()
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
      if (bot.throttle && pausing) {
        get('console').info(pause_msg)
        return setTimeout(getNext, 6000)
      }
      setImmediate(getNext)
    })
  }
  setImmediate(getNext)
  return null
}