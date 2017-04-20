var parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  return function (cb) {
    var exchanges = get('exchanges.list')
    var tasks = {}
    exchanges.forEach(function (exchange) {
      tasks[exchange.name] = exchange.getProducts
    })
    parallel(tasks, function (err, results) {
      if (err) return cb(err)
      var result = []
      Object.keys(results).forEach(function (exchange_name) {
        results[exchange_name].forEach(function (product_id) {
          result.push(exchange_name + '.' + product_id)
        })
      })
      cb(null, result)
    })
  }
}