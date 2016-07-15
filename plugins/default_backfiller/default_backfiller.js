var n = require('numbro')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var c = get('constants')
  var get_time = get('utils.get_time')
  //var reduce_trades = get('utils.reduce_trades')
  var get_timestamp = get('utils.get_timestamp')
  var get_products = get('utils.get_products')
  var log_trades = get('utils.log_trades')
  return function () {
    var rs = get('run_state')
    backfill_trades()
    function backfill_trades () {
      rs.tick = tb(c.tick_size).toString()
      var tasks = get('exchanges').map(function (exchange) {
        return function (cb) {
          var products = get_products(exchange)
          var limit = c.backfiller_limit
          var tasks = products.map(function (product) {
            return function (done) {
              if (!exchange.backfiller) return done(null, [])
              exchange.backfiller(product.id, limit, function (err, trades) {
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
      parallel(tasks, backfill_trades)
    }
  }
}