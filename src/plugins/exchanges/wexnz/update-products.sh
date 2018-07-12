#!/usr/bin/env node
var request = require('micro-request')
request('https://wex.nz/api/3/info', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, body) {
  if (err) throw err
  if (resp.statusCode !== 200) {
    var err = new Error('non-200 status: ' + resp.statusCode)
    err.code = 'HTTP_STATUS'
    err.body = body
    console.error(err)
    process.exit(1)
  }
  var products = []
  pairs = body.pairs
  Object.keys(body.pairs).forEach(function (product) {
    var min = pairs[product].min_amount
    products.push({
      asset: product.split('_')[0].toUpperCase(),
      currency: product.split('_')[1].toUpperCase(),
      min_size: pairs[product].min_amount.toString(),
      max_size: pairs[product].max_price.toString(),
      increment: '0.0001',
      label: (product.split('_')[0] + '/' + product.split('_')[1]).toUpperCase()
    })
  })
  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
