import 'colors'

import fs from 'fs'

import { getProducts } from '../plugins/exchanges'

export default (program) => {
  program
    .command('list-selectors')
    .description('list available selectors')
    .action(function(/*cmd*/) {
      var exchanges = fs.readdirSync('./plugins/exchanges')
      exchanges.forEach(function(exchange) {
        if (exchange === 'sim' || exchange === '_stub') return

        console.log(`${exchange}:`)
        var products = getProducts(exchange)
        products.sort(function(a, b) {
          if (a.asset < b.asset) return -1
          if (a.asset > b.asset) return 1
          if (a.currency < b.currency) return -1
          if (a.currency > b.currency) return 1
          return 0
        })
        products.forEach(function(p) {
          console.log(
            '  ' +
              exchange.cyan +
              '.'.grey +
              p.asset.green +
              '-'.grey +
              p.currency.cyan +
              (p.label ? ('   (' + p.label + ')').grey : '')
          )
        })
      })
      process.exit()
    })
}
