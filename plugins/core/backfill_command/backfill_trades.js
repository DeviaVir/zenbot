var n = require('numbro')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  function backfill_trades () {
    var command = get('commands.backfill')
    var get_products = get('utils.get_products')
    var log_trades = get('utils.log_trades')
    var rs = get('run_state')
    rs.tick = tb(c.tick_size).toString()
    var tasks = get('exchanges').map(function (exchange) {
      return function task (cb) {
        var products = get_products(exchange)
        var tasks = products.map(function (product) {
          return function task (done) {
            if (!exchange.backfill_trades) return done(null, [])
            exchange.backfill_trades(product.id, command.limit, function (err, trades) {
              if (err) {
                err.slug = exchange.slug
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
        get('logger').error('[' + err.slug + ']', err, {public: false})
      }
      var timeout = setTimeout(backfill_trades, 0)
      set('timeouts[]', timeout)
    })
  }
  return backfill_trades
}