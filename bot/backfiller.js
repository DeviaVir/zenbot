var n = require('numbro')
  , c = require('../conf/constants.json')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var get_time = get('utils.get_time')
  var bot = get('bot')
  var reduce_trades = get('utils.reduce_trades')
  var series = get('motley:vendor.run-series')
  var get_timestamp = get('utils.get_timestamp')
  get('motley:db.mems').load('backfiller', function (err, rs) {
    if (err) throw err
    if (!rs) rs = {id: 'backfiller'}
    backfill_trades()
    function backfill_trades () {
      rs.tick = tb(c.tick_size).toString()
      var tasks = c.exchanges.map(function (exchange) {
        return function (done) {
          get('exchanges.' + exchange).backfill_trades(rs, function (err, results) {
            if (err) {
              err.exchange = exchange
              return done(err)
            }
            if (results.length) {
              var min_time
              results.sort(function (a, b) {
                if (a.size > b.size) return -1
                if (a.size < b.size) return 1
                return 0
              })
              var ticker = results.slice(0, 3).map(function (trade) {
                min_time = min_time ? Math.min(min_time, trade.time) : trade.time
                return trade.side + ' ' + n(trade.size).format('0.000') + ' ' + trade.asset + ' at ' + n(trade.price).format('0.000') + ' ' + trade.currency
              }).join(', ')
              ticker = get_timestamp(min_time).grey + ' ' + ticker
              get('console').info('backfilled', exchange, results.length, 'trades. ' + ticker)
            }
            done(null, results)
          })
        }
      })
      parallel(tasks, function (err, results) {
        if (err) {
          setImmediate(backfill_trades)
          return get('console').error('fetch trades err', err.exchange, err)
        }
        var trades = [].concat.apply([], [].concat.apply([], results)).filter(function (trade) {
          return !!trade
        })
        var tasks = trades.map(function (trade) {
          return function (done) {
            trade.processed = false
            get('motley:db.trades').save(trade, done)
          }
        })
        parallel(tasks, function (err) {
          if (err) {
            setImmediate(backfill_trades)
            return get('console').error('record trades err', err)
          }
          reduce_trades(function (err) {
            setImmediate(backfill_trades)
            if (err) {
              return get('console').error('reduce trades err', err)
            }
            get('motley:db.mems').save(rs, function (err) {
              if (err) {
                return get('console').error('save backfiller rs err', err)
              }
            })
          })
        })
      })
    }
    backfill_trades()
  })
  return null
}