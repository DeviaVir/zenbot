#!/usr/bin/env node
const ccxt = require ('ccxt')
const c = require('../../../conf')

const therock = new ccxt.therock ({
  'apiKey': c.therock.key,
  'secret': c.therock.secret,
})

therock.fetch_markets('BTCUSD')
  .then(result =>   {
    var products = []
    result.forEach(function (product) {
      console.log(product)
      products.push({
        asset: product.base,
        currency: product.quote,
        increment: '0.000001',
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
