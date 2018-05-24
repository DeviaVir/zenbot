// eslint-disable-next-line no-unused-vars
var colors = require('colors'),
  fs = require('fs'),
  _ = require('lodash')

module.exports = function (program) {
  program
    .command('list-selectors')
    .description('list available selectors')
    .option('-e, --exchange <exchange>', 'Filter to only show given exchange (default: '*')',String,'*')
    .option('-c, --currency <currency>', 'Filter to only show given currency (default: '*')',String,'*')
    .option('-a, --asset <asset>', 'Filter to only show given asset (default: '*')',String,'*')
    .option('-d, --no-details <details>', 'Prints selectors without additional details')
    .action(function(cmd) {
      var exchanges = fs.readdirSync('./extensions/exchanges')
      if (cmd.exchange != '*') {
        exchanges = _.filter(exchanges,(item)=>{
          return cmd.exchange === item
        })
      }
      exchanges.forEach(function(exchange){
        if (exchange === 'sim' || exchange === '_stub') return

        if (cmd.details === 'true') console.log(`${exchange}:`)
        var products = require(`../extensions/exchanges/${exchange}/products.json`)
        if (cmd.currency != '*'){
          products = _.filter(products,(item)=>{
            return cmd.currency === item.currency
          })
        }

        if (cmd.asset !='*'){
          products = _.filter(products,(item)=>{
            return cmd.asset === item.asset
          })
        }
        products.sort(function (a, b) {
          if (a.asset < b.asset) return -1
          if (a.asset > b.asset) return 1
          if (a.currency < b.currency) return -1
          if (a.currency > b.currency) return 1
          return 0
        })
        products.forEach(function (p) {
          if (cmd.details === 'True') {
            console.log('  ' + exchange.cyan + '.'.grey + p.asset.green + '-'.grey + p.currency.cyan + (p.label ? ('   (' + p.label + ')').grey : ''))
          } else {
            console.log(exchange.cyan + '.'.grey + p.asset.green + '-'.grey + p.currency.cyan)
          }

        })
      })
      process.exit()
    })
}
