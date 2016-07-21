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
      trade.orig_trade_id = trade.id
      trade.id = trade.exchange + '-' + trade.orig_trade_id
      c.tick_sizes.forEach(function (size) {
        var tickId = tb(trade.time)
          .resize(size)
          .toString()
        ticks[tickId] || (ticks[tickId] = {trades: [], size: size})
        ticks[tickId].trades.push(trade)
      })
    })
    Object.keys(ticks).forEach(function (tickId) {
      tasks.push(function (done) {
        get('motley:db.ticks').load(tickId, function (err, tick) {
          if (err) return done(err)
          if (!tick) {
            var bucket = tb(ticks[tickId].trades[0].time).resize(ticks[tickId].size)
            tick = {
              id: bucket.toString(),
              size: ticks[tickId].size,
              time: bucket.toMilliseconds(),
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
          create_tick(tick, ticks[tickId].trades, done)
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