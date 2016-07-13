var n = require('numbro')
  , c = require('../conf/constants.json')
  , tb = require('timebucket')
  , run = require('run-parallel')

module.exports = function container (get, set, clear) {
  var get_time = get('utils.get_time')
  var bot = get('bot')
  if (bot.tweet) {
    var twitter = get('utils.twitter')
    function on_tweet (err, data, response) {
      if (err) return get('console').error('tweet err', err)
      if (response.statusCode === 200 && data && data.id_str) {
        get('console').info('tweeted: '.cyan + data.text.white, {public: true, data: {tweet: data}})
        get('console').info('tweeted: '.cyan + data.text.white, {public: false, data: {tweet: data}})
      }
      else get('console').error('tweet err', response.statusCode, data)
    }
  }
  var rs = {}
  function record_trades () {
    var tasks = c.exchanges.map(function (exchange) {
      return function (cb) {
        get('exchanges.' + exchange).record_trades(rs, cb)
      }
    })
    run(tasks, function (err, results) {
      if (err) {
        return get('console').error('fetch trades err', err)
      }
      var trades = [].concat.apply([], [].concat.apply([], results))
      var tasks = trades.map(function (trade) {
        return function (done) {
          trade.processed = false
          get('motley:db.trades').save(trade, done)
        }
      })
      run(tasks, function (err) {
        if (err) {
          return get('console').error('record trades err', err)
        }
      })
    })
    record_ticks()
  }
  rs.tick = tb('')
  function record_ticks () {
    get('motley:db.trades').select({query: {processed: false}}, function (err, trades) {
      if (err) return get('console').error('select trades err', err)
      var ticks = {}
      trades.forEach(function (trade) {
        var tickId = tb(trade.time)
          .resize(c.tick_size)
          .toString()
        ticks[tickId] || (ticks[tickId] = [])
        ticks[tickId].push(trade)
      })
      var tasks = []
      Object.keys(ticks).forEach(function (tickId) {
        ticks[tickId].sort(function (a, b) {
          if (a.time < b.time) return -1
          if (a.time > b.time) return 1
          return 0
        })
        tasks.push(function (done) {
          get('motley:db.ticks').load(tickId, function (err, tick) {
            if (err) return done(err)
            get('motley:db.ticks').create(tick, trades, done)
          })
        })
      })
      run(tasks, function (err) {
        if (err) {
          return get('console').error('create ticks err', err)
        }
      })
    })
  }
  function process_trades (trades) {
    var ticks = {}
    trades.forEach(function (trade) {
      var tickId = tb(trade.time)
        .resize(c.tick_size)
        .toString()
      ticks[tickId] || (ticks[tickId] = [])
      ticks[tickId].push(trade)
    })
    Object.keys(ticks).forEach(function (tickId) {
      var tick = get('motley:db.ticks').create(ticks[tickId])
      if (tick) {
        get('console').info(tick.trade_ticker, tick.exchanges, {data: {tick: tick}})
        var ratio = tick.buy_ratio
        if (tick.side === 'SELL') {
          ratio = n(1)
            .subtract(ratio)
            .value()
        }
        var vol = n(tick.vol)
          .multiply(ratio)
          .value()
        if (bot.tweet && tick.vol >= 20) {
          var tweet = {
            status: [
              'big ' + tick.side + ':',
              'size: ' + n(vol).format('0.000') + ' ' + c.asset,
              'price: ' + tick.price,
              'time: ' + get_time(tick.time),
              c.base_url + '/#t__' + (new Date().getTime() + 30000) + ' ' + c.hashtags
            ].join('\n')
          }
          twitter_client.post('statuses/update', tweet, on_tweet)
        }
      }
    })
    get('console').info('saw ' + trades.length + ' trades.')
  }
  record_trades()
  return setInterval(record_trades, c.tick_ms)
}