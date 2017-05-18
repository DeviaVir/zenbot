#!/usr/bin/env node
var request = require('micro-request')
request('https://api.bitfinex.com/v1/symbols_details', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, body) {
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
      id: product.pair,
//      asset: product.base_currency,
//      currency: product.quote_currency,
      min_size: Number(product.minimum_order_size),
      max_size: Number(product.maximum_order_size),
      increment: Number(product.minimum_order_size),
//      label: product.display_name
    })
  })
  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})