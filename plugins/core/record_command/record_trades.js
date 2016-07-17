var n = require('numbro')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  /*
  var c = get('constants')
  var get_time = get('utils.get_time')
  var get_timestamp = get('utils.get_timestamp')
  var get_products = get('utils.get_products')
  var log_trades = get('utils.log_trades')
  var recorder = require('./recorder.json')
  recorder.run = function () {
    var rs = get('run_state')
    record_trades()
    function record_trades () {
      rs.tick = tb(c.tick_size).toString()
      var tasks = get('exchanges').map(function (exchange) {
        return function (cb) {
          var products = get_products(exchange)
          var tasks = products.map(function (product) {
            return function (done) {
              if (!exchange.recorder) return done(null, [])
              exchange.recorder(product.id, function (err, trades) {
                if (err) {
                  err.exchange = exchange.slug
                  return done(err)
                }
                log_trades(exchange, trades)
                done(null, trades)
              })
            }
          })
          parallel(tasks, cb)
        }
      })
      parallel(tasks, function (err) {
        if (err) {
          get('logger').error('[' + err.exchange + ']', err, {public: false})
        }
        setTimeout(record_trades, )
      })
    }
  }
  return recorder
  */
  return null
}