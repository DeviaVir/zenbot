var colors = require('colors')

module.exports = function container (get, set, clear) {
  return function (program) {
    program
      .command('list-selectors')
      .description('list available selectors')
      .action(function (cmd) {
        console.log()
        get('exchanges.list').forEach(function (x) {
          console.log(x.name + ':')
          var products = x.getProducts().sort(function (a, b) {
            if (a.asset < b.asset) return -1
            if (a.asset > b.asset) return 1
            if (a.currency < b.currency) return -1
            if (a.currency > b.currency) return 1
            return 0
          })
          products.forEach(function (p) {
            console.log('  ' + x.name.cyan + '.'.grey + p.asset.green + '-'.grey + p.currency.cyan + (p.label ? ('   (' + p.label + ')').grey : ''))
          })
          console.log()
        })
        process.exit()
      })
  }
}