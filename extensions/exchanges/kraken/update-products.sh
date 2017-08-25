#!/usr/bin/env node

var KrakenClient = require('kraken-api')
var kraken = new KrakenClient()

var mapping
var products = []

function addProduct(base, quote, altname) {
  products.push({
    asset: base,
    currency: quote,
    min_size: '0.01',
    increment: '0.00000001',
    label: getPair(base) + '/' + getPair(quote)
  })
}

function getPair(name) {
  return mapping[name].altname
}

kraken.api('Assets', null, function(error, data) {
  if (error) {
    console.log(error)
    process.exit(1)
  } else {

    mapping = data.result

    kraken.api('AssetPairs', null, function(error, data) {
      if (error) {
        console.log(error)
        process.exit(1)
      } else {
        Object.keys(data.result).forEach(function(result) {
          if (!result.match('\.d')) {
            addProduct(data.result[result].base, data.result[result].quote, data.result[result].altname)
          }
        })
        var target = require('path').resolve(__dirname, 'products.json')
        require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
        console.log('wrote', target)
        process.exit()
      }
    })
  }
})
