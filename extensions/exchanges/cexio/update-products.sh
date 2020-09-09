#!/usr/bin/env node
const ccxt = require('ccxt')
const path = require('path')
var client = new ccxt.cex()
client.fetchMarkets().then(result => {
  var products = []
  result.forEach(function (product) {
    var increment = ''
    if (product.info.symbol1 === 'BTC' && product.info.symbol2 !== 'RUB') {
      increment = '0.1'
    } else if (product.info.symbol1 === 'BTC' && product.info.symbol2 === 'RUB') {
      increment = '1'
    } else if (product.info.symbol2 === 'BTC' && (product.info.symbol1 === 'XRP' || product.info.symbol1 === 'GHS')) {
      increment = '0.00000001'
    } else if (product.info.symbol2 === 'BTC') {
      increment = '0.000001'
    } else if (product.info.symbol1 === 'XRP') {
      increment = '0.0001'
    } else {
      increment = '0.01'
    }
    products.push({
      asset: product.info.symbol1,
      currency: product.info.symbol2,
      min_size: product.info.minLotSize.toString(),
      max_size: product.info.maxLotSize != null ? product.info.maxLotSize.toString() : product.info.maxLotSize,
      increment: increment,
      label: product.id
    })
  })
  var target = path.resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
