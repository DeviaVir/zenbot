var n = require('numbro')
  , colors = require('colors')
  , tb = require('timebucket')
  , parallel = require('run-parallel')
  , zerofill = require('zero-fill')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var get_timestamp = get('utils.get_timestamp')
  var program = get('program')
  var get_time = get('utils.get_time')
  var log_trades = get('utils.log_trades')
  var c = get('constants')
  var config = get('config')
  var create_tick = get('create_tick')
  var idle = false
  return function reduce_trades () {
    get('motley:db.trades').select({query: {processed: false}, limit: c.trade_reducer_limit, sort: {time: 1}}, function (err, trades) {
      if (err) {
        throw err
      }
      var ticks = {}
      var tasks = []
      trades.forEach(function (trade) {
        var tickId = tb(trade.time)
          .resize(c.tick_size)
          .toString()
        ticks[tickId] || (ticks[tickId] = [])
        ticks[tickId].push(trade)
      })
      Object.keys(ticks).forEach(function (tickId) {
        tasks.push(function (done) {
          get('motley:db.ticks').load(tickId, function (err, tick) {
            if (err) return done(err)
            create_tick(tick, ticks[tickId], done)
          })
        })
      })
      parallel(tasks, function (err) {
        if (err) {
          throw err
        }
        tasks = []
        trades.forEach(function (trade) {
          tasks.push(function (done) {
            trade.processed = true
            get('motley:db.trades').save(trade, done)
          })
        })
        parallel(tasks, function (err, results) {
          if (err) {
            throw err
          }
          if (trades.length) {
            idle = false
            log_trades('trade_reducer', trades)
          }
          else if (!idle) {
            idle = true
            get('logger').info('trade_reducer', 'idle'.grey)
          }
          var timeout = setTimeout(reduce_trades, trades.length ? 0 : c.tick)
          set('timeouts[]', timeout)
        })
      })
    })
  }
}