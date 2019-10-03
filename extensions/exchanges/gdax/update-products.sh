#!/usr/bin/env node
var request = require('micro-request')
request('https://api.pro.coinbase.com/products', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, body) {
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
    let regex = /\.0*$|(\.\d*[1-9])0+$/
    products.push({
      asset: product.base_currency,
      currency: product.quote_currency,
      //min_size: product.base_min_size,
      //max_size: product.base_max_size,
      //increment: product.quote_increment,
      //asset_increment: product.base_increment,
      min_size: Number(product.base_min_size).toFixed(10).replace(regex,'$1'),
      max_size: Number(product.base_max_size).toFixed(10).replace(regex,'$1'),
      increment: Number(product.quote_increment).toFixed(10).replace(regex,'$1'),
      asset_increment: Number(product.base_increment).toFixed(10).replace(/\.0*$|(\.\d*[1-9])0+$/,'$1'),
      label: product.display_name
    })
  })
  products.sort(function(a, b) {
    var nameA = a.label.toUpperCase(); // ignore upper and lowercase
    var nameB = b.label.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });
  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
