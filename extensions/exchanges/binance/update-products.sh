#!/usr/bin/env node
let ccxt = require('ccxt')

new ccxt.binance().fetch_markets().then(function(markets) {
  var products = []

  markets.forEach(function (market) {
    products.push({
      id: market.id,
      asset: market.base,
      currency: market.quote,
      min_size: market.info.filters[1].minQty,
      max_size: market.info.filters[0].maxPrice,
      increment: market.info.filters[1].stepSize,
      label: market.base + '/' + market.quote
    })
  })

  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
