#!/usr/bin/env node
var request = require('micro-request')
request('https://cex.io/api/currency_limits', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, body) {
  if (err) throw err
  if (resp.statusCode !== 200) {
    var err = new Error('non-200 status: ' + resp.statusCode)
    err.code = 'HTTP_STATUS'
    err.body = body
    console.error(err)
    process.exit(1)
  }
  var products = []
  var pairs = body.data.pairs
  pairs.forEach(function (product) {
    products.push({
      asset: product.symbol1,
      currency: product.symbol2,
      min_size: product.minLotSize.toString(),
      max_size: product.maxLotSize != null ? product.maxLotSize.toString() : product.maxLotSize,
      increment: '0.00000001',
      label: product.symbol1 + '/' + product.symbol2
    })
  })
  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
