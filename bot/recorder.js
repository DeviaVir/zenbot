var n = require('numbro')
  , c = require('../conf/constants.json')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var get_time = get('utils.get_time')
  var bot = get('bot')
  var reduce_trades = get('utils.reduce_trades')
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
    rs.tick = tb(c.tick_size).toString()
    var tasks = c.exchanges.map(function (exchange) {
      return function (done) {
        get('exchanges.' + exchange).record_trades(rs, function (err, results) {
          if (err) {
            err.exchange = exchange
            return done(err)
          }
          done(null, results)
        })
      }
    })
    parallel(tasks, function (err, results) {
      if (err) {
        return get('console').error('fetch trades err', err.exchange, err)
      }
      var trades = [].concat.apply([], [].concat.apply([], results))
      var tasks = trades.map(function (trade) {
        return function (done) {
          trade.processed = false
          get('motley:db.trades').save(trade, done)
        }
      })
      parallel(tasks, function (err) {
        if (err) {
          return get('console').error('record trades err', err)
        }
      })
    })
    reduce_trades()
  }
  record_trades()
  return setInterval(record_trades, c.tick_ms)
}