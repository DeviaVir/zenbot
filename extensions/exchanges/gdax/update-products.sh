#!/usr/bin/env node
var request = require('micro-request')
request('https://api.gdax.com/products', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, body) {
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
      asset: product.base_currency,
      currency: product.quote_currency,
      min_size: product.base_min_size,
      max_size: product.base_max_size,
      increment: product.quote_increment,
      label: product.display_name
    })
  })
  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})