var n = require('numbro')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  return function record (options) {
    
  }
  var get_time = get('utils.get_time')
  var bot = get('bot')
  var reduce_trades = get('utils.reduce_trades')
  var get_timestamp = get('utils.get_timestamp')
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
  get('motley:db.mems').load('recorder', function (err, rs) {
    if (err) throw err
    if (!rs) rs = {id: 'recorder'}
    function record_trades () {
      rs.tick = tb(c.tick_size).toString()
      var tasks = c.exchanges.map(function (exchange) {
        return function (done) {
          get('exchanges.' + exchange).record_trades(rs, function (err, results) {
            if (err) {
              err.exchange = exchange
              return done(err)
            }
            if (results.length) {
              var max_time = 0
              results.sort(function (a, b) {
                if (a.size > b.size) return -1
                if (a.size < b.size) return 1
                return 0
              })
              var ticker = results.slice(0, 3).map(function (trade) {
                max_time = Math.max(max_time, trade.time)
                return trade.side + ' ' + n(trade.size).format('0.000') + ' ' + trade.asset + ' at ' + n(trade.price).format('0.000') + ' ' + trade.currency
              }).join(', ')
              ticker = get_timestamp(max_time).grey + ' ' + ticker
              get('console').info('recorded', exchange, results.length, 'trades. ' + ticker)
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
          get('motley:db.mems').save(rs, function (err) {
            if (err) {
              return get('console').error('save recorder rs err', err)
            }
          })
        })
      })
      reduce_trades()
    }
    record_trades()
    setInterval(record_trades, c.tick_ms)
  })
  return null
}