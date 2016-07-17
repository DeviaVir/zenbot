var n = require('numbro')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  function reduce (options) {
    var command = get('commands.reduce')
    var get_products = get('utils.get_products')
    var log_trades = get('utils.log_trades')
    var rs = get('run_state')
    var c = get('constants')
    var config = get('config')
    rs.tick = tb(c.tick_size).toString()
    var tasks = get('exchanges').map(function (exchange) {
      
    })
    parallel(tasks, function (err) {
      if (err) {
        get('logger').error('[' + err.exchange + ']', err.message, {public: false})
      }
      var timeout = setTimeout(function () {
        reduce(options)
      }, c.mapreduce_timeout)
      set('timeouts[]', timeout)
    })
  }
  return reduce
}