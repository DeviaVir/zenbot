var path = require('path')
var parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  return function (program) {
    program
      .command('list-selectors')
      .description('list available selectors to watch')
      .action(function (cmd) {
        var exchanges = get('exchanges.list')
        var tasks = {}
        exchanges.forEach(function (exchange) {
          tasks[exchange.name] = exchange.getProducts
        })
        parallel(tasks, function (err, results) {
          if (err) throw err
          Object.keys(results).forEach(function (exchange_name) {
            console.log()
            console.log(exchange_name)
            console.log()
            results[exchange_name].forEach(function (product_id) {
              console.log('  ' + exchange_name + '.' + product_id)
            })
          })
          console.log()
          process.exit(0)
        })
      })
  }
}