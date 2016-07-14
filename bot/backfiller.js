var n = require('numbro')
  , c = require('../conf/constants.json')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var get_time = get('utils.get_time')
  var bot = get('bot')
  var reduce_trades = get('utils.reduce_trades')
  var rs = {}
  var series = get('motley:vendor.run-series')
  function backfill_trades () {
    rs.tick = tb(c.tick_size).toString()
    var tasks = c.exchanges.map(function (exchange) {
      return function (done) {
        get('exchanges.' + exchange).backfill_trades(rs, function (err, results) {
          if (err) {
            err.exchange = exchange
            return done(err)
          }
          get('console').info('got', results.length, 'trades.')
          done(null, results)
        })
      }
    })
    parallel(tasks, function (err, results) {
      if (err) {
        setImmediate(backfill_trades)
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
          setImmediate(backfill_trades)
          return get('console').error('record trades err', err)
        }
        reduce_trades(function (err) {
          setImmediate(backfill_trades)
          if (err) {
            return get('console').error('reduce trades err', err)
          }
        })
      })
    })
  }
  backfill_trades()
  return null
}