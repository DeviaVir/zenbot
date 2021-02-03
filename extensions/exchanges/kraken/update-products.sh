#!/usr/bin/env node

var KrakenClient = require('kraken-api')
var kraken = new KrakenClient()

var mapping
var products = []

function addProduct(base, quote, altname, min_size, increment) {
  products.push({
    asset: base,
    currency: quote,
    min_size: parseFloat(min_size).toFixed(10),
    increment: (10 ** (-1 * increment)).toFixed(10),
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
            addProduct(data.result[result].base, data.result[result].quote, data.result[result].altname,
                       data.result[result].ordermin, data.result[result].pair_decimals)
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
