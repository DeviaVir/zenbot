#!/usr/bin/env node

var KrakenClient = require('kraken-api')
var kraken = new KrakenClient()

var products = []

function addProduct (base, quote, label, min_size, increment) {
  products.push({
    asset: base,
    currency: quote,
    min_size: parseFloat(min_size).toFixed(10),
    increment: (10 ** (-1 * increment)).toFixed(10),
    label: label
  })
}

kraken.api('AssetPairs', null, function (error, data) {
  if (error) {
    console.log(error)
    process.exit(1)
  } else {
    Object.keys(data.result).forEach(function (pair) {
      if (!pair.match('.d')) {
        if (!data.result[pair].wsname) {
          console.warn(`Cannot identify pair for ${pair}`)
          return
        }
        const wsname = data.result[pair].wsname
        const split = wsname.split('/')
        const asset = pair.substring(0, pair.indexOf(split[0]) + split[0].length)
        const currency = pair.substring(asset.length)

        addProduct(asset, currency, wsname,
          data.result[pair].ordermin, data.result[pair].pair_decimals)
      }
    })
    var target = require('path').resolve(__dirname, 'products.json')
    require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
    console.log('wrote', target)
    process.exit()
  }
})
