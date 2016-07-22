var parallel = require('run-parallel')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('constants')
  var create_tick = get('create_tick')
  var get_timestamp = get('utils.get_timestamp')
  return function process_trades (trades, cb) {
    var ticks = {}
    var tasks = []
    trades.forEach(function (trade) {
      c.tick_sizes.forEach(function (size) {
        var tickId = tb(trade.time)
          .resize(size)
          .toString()
        ticks[tickId] || (ticks[tickId] = {trades: [], size: size})
        ticks[tickId].trades.push(trade)
      })
    })
    Object.keys(ticks).forEach(function (tickId) {
      var t = ticks[tickId]
      tasks.push(function (done) {
        get('motley:db.ticks').load(tickId, function (err, tick) {
          if (err) return done(err)
          if (!tick) {
            var bucket = tb(t.trades[0].time).resize(t.size)
            tick = {
              id: bucket.toString(),
              complete: false,
              seen: false,
              size: t.size,
              time: bucket.toMilliseconds(),
              min_time: null,
              max_time: null,
              vol: 0,
              trades: 0,
              buys: 0,
              buy_vol: 0,
              exchanges: {},
              trade_ids: [],
              avg_price: null,
              high: 0,
              low: 100000,
              close: null,
              close_time: null
            }
            tick.timestamp = get_timestamp(tick.time)
          }
          create_tick(tick, t.trades, done)
        })
      })
    })
    parallel(tasks, function (err) {
      if (err) return cb(err)
      tasks = []
      trades.forEach(function (trade) {
        tasks.push(function (done) {
          trade.processed = true
          get('motley:db.trades').save(trade, done)
        })
      })
      parallel(tasks, cb)
    })
  }
}