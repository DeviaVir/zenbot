// eslint-disable-next-line no-unused-vars
var colors = require('colors'),
  fs = require('fs')

module.exports = function (program) {
  program
    .command('list-selectors')
    .description('list available selectors')
    .action(function (/*cmd*/) {
      var exchanges = fs.readdirSync('./extensions/exchanges')
      exchanges.forEach(function(exchange){
        console.log(`${exchange}:`)
        var products = require(`../extensions/exchanges/${exchange}/products.json`)
        products.sort(function (a, b) {
          if (a.asset < b.asset) return -1
          if (a.asset > b.asset) return 1
          if (a.currency < b.currency) return -1
          if (a.currency > b.currency) return 1
          return 0
        })
        products.forEach(function (p) {
          console.log('  ' + exchange.cyan + '.'.grey + p.asset.green + '-'.grey + p.currency.cyan + (p.label ? ('   (' + p.label + ')').grey : ''))
        })
      })
      process.exit()
    })
}
