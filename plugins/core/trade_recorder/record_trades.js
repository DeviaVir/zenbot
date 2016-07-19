var n = require('numbro')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  function backfill (options) {
    var get_products = get('utils.get_products')
    var log_trades = get('utils.log_trades')
    var rs = get('run_state')
    var c = get('constants')
    var config = get('config')
    rs.tick = tb(c.tick_size).toString()
    var tasks = get('exchanges').map(function (exchange) {
      return function task (cb) {
        get('logger').info('[' + exchange.name + ']'.blue, 'recording trades...')
        var products = get_products(exchange)
        var tasks = products.map(function (product) {
          return function task (done) {
            try {
              var recorder = get('exchanges.' + exchange.name + '.recorder')
            }
            catch (e) {
              throw e
              return done(null, [])
            }
            get('logger').info('[' + exchange.name + ']'.blue, product.id, 'recording trades...')
            recorder(product.id, options.limit, function (err, trades) {
              if (err) {
                err.exchange = exchange.name
                return done(err)
              }
              get('logger').info('[' + exchange.name + ']'.blue, 'got', trades.length, 'trades.')
              var tasks = trades.map(function (trade) {
                return function task (done) {
                  trade.id = exchange.name + '-' + config.asset + '-' + config.currency + '-' + trade.id
                  trade.asset = config.asset
                  trade.currency = config.currency
                  trade.exchange = exchange.name
                  trade.processed = false
                  get('motley:db.trades').save(trade, done)
                }
              })
              parallel(tasks, function (err) {
                if (err) return done(err)
                log_trades(exchange.name, trades)
                done()
              })
            })
          }
        })
        parallel(tasks, cb)
      }
    })
    parallel(tasks, function (err) {
      if (err) {
        get('logger').error('[' + err.exchange + ']', err.message, {public: false})
      }
      var timeout = setTimeout(function () {
        record(options)
      }, c.record)
      set('timeouts[]', timeout)
    })
  }
  return record
}