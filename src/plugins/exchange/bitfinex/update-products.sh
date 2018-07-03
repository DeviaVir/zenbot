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
    var min_size = parseFloat(product.minimum_order_size)
    var prec = 0
    if (min_size > 130 ) {
      prec = 4 
    } else if (min_size > 30) {
      prec = 3
    } else if (min_size > 1) {
      prec = 2
    } else if (min_size > 0.1) {
      prec = 1
    }
    var increment = '0.' + '0'.repeat(prec + product.price_precision - (product.pair.substring(3, 6).toUpperCase() == 'USD' ? 3 : 0)) + '1'
    products.push({
//     id: product.pair,
      asset: product.pair.substring(0, 3).toUpperCase(),
      currency: product.pair.substring(3, 6).toUpperCase(),
      min_size: product.minimum_order_size,
      max_size: product.maximum_order_size,
      increment: increment,
      label: product.pair.substring(0, 3).toUpperCase() + '/' + product.pair.substring(3, 6).toUpperCase()
    })
  })
  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
