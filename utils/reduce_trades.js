var tb = require('timebucket')
  , c = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  var get_time = get('utils.get_time')
  var series = get('motley:vendor.run-series')
  var create_tick = get('utils.create_tick')
  return function reduce_trades (cb) {
    get('motley:db.trades').select({query: {processed: false}, limit: c.record_ticks_limit}, function (err, trades) {
      if (err) {
        if (cb) return cb(err)
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
            create_tick(tick, ticks[tickId], function (err, tick) {
              if (err) return done(err)
              if (bot.tweet && tick.side_vol >= c.big_trade) {
                var tweet = {
                  status: [
                    'big ' + tick.side + ':',
                    'size: ' + n(tick.side_vol).format('0.000') + ' ' + c.asset,
                    'price: ' + tick.price,
                    'time: ' + get_time(tick.time),
                    c.base_url + '/#t__' + (new Date().getTime() + 30000) + ' ' + c.hashtags
                  ].join('\n')
                }
                twitter.post('statuses/update', tweet, on_tweet)
              }
              done(null, tick)
            })
          })
        })
      })
      trades.forEach(function (trade) {
        tasks.push(function (done) {
          trade.processed = true
          get('motley:db.trades').save(trade, done)
        })
      })
      series(tasks, function (err) {
        if (err) {
          if (cb) return cb(err)
          throw err
        }
        cb && cb()
      })
    })
  }
}