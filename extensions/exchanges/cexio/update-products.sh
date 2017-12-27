#!/usr/bin/env node
const ccxt = require('ccxt')
const path = require('path')
var client = new ccxt.cex()
client.fetchMarkets().then(result => {
  var products = []
  result.forEach(function (product) {
    products.push({
      asset: product.info.symbol1,
      currency: product.info.symbol2,
      min_size: product.info.minLotSize.toString(),
      max_size: product.info.maxLotSize != null ? product.info.maxLotSize.toString() : product.info.maxLotSize,
      increment: product.info.symbol1 === 'BTC' ? '0.01' : (product.info.symbol2 === 'BTC' ? '0.00000001' : '0.0001'),
      label: product.id
    })
  })
  var target = path.resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
