#!/usr/bin/env node
const ccxt = require ('ccxt')
const c = require('../../../conf')

const hitbtc = new ccxt.hitbtc2 ({
  'apiKey': c.hitbtc.key,
  'secret': c.hitbtc.secret,
})

hitbtc.fetch_markets('BTCUSD')
  .then(result =>   {
    var products = []
    result.forEach(function (product) {
      console.log(product)
      products.push({
        asset: product.base,
        currency: product.quote,
        increment: product.step.toString(),
        label: product.symbol
      })
    })
    var target = require('path').resolve(__dirname, 'products.json')
    require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
    console.log('wrote', target)
    process.exit()
  })
  .catch(function (error) {
    console.error('An error occurred', error)
    process.exit(1)
  })
