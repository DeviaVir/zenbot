#!/usr/bin/env node
var request = require('micro-request')
request('https://api.gemini.com/v1/symbols', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, body) {
  if (err) throw err
  if (resp.statusCode !== 200) {
    var err = new Error('non-200 status: ' + resp.statusCode)
    err.code = 'HTTP_STATUS'
    err.body = body
    console.error(err)
    process.exit(1)
  }
  var products = []
  body.forEach(function (product) {
    products.push({
      asset: product.substring(0, 3).toUpperCase(),
      currency: product.substring(3, 6).toUpperCase(),
      min_size: (product.substring(0, 3).toUpperCase() === 'BTC') ? '0.00001' : '0.001',
      max_size: '10000',
      increment: (product.substring(3, 6).toUpperCase() === 'BTC') ? '0.00001' : '0.01',
      label: product.substring(0, 3).toUpperCase() + '/' + product.substring(3, 6).toUpperCase()
    })
  })
  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
