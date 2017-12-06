#!/usr/bin/env node
var request = require('micro-request')
request('https://www.binance.com/exchange/public/product', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, body) {
  if (err) throw err
  if (resp.statusCode !== 200) {
    var err = new Error('non-200 status: ' + resp.statusCode)
    err.code = 'HTTP_STATUS'
    err.body = body
    console.error(err)
    process.exit(1)
  }
  var products = []
  body.data.forEach(function (product) {
    products.push({
      id: product.symbol,
      asset: product.baseAsset,
      currency: product.quoteAsset,
      min_size: product.minTrade,
      max_size: '100000',
      increment: product.tickSize,
      label: product.baseAsset + '/' + product.quoteAsset
    })
  })
  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
