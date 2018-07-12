#!/usr/bin/env node
const ccxt = require ('ccxt')
const c = require('../../../conf')
const n = require('numbro')

const hitbtc = new ccxt.hitbtc2 ({
  'apiKey': c.hitbtc.key,
  'secret': c.hitbtc.secret,
})

hitbtc.fetch_markets()
  .then(result =>   {
    var products = []
    result.forEach(function (product) {
      products.push({
        asset: product.base,
        currency: product.quote,
        min_size: product.limits.amount.min,    
        max_size: product.limits.amount.max, 
        increment: n(product.step).format('0.000000000000000000'),
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
