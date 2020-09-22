#!/usr/bin/env node
let ccxt = require('ccxt')

new ccxt.bitstamp().fetch_markets().then(function(markets) {
  var products = []

  var products = markets.map(function (market) {
    return {
      id: market.id.toUpperCase(),
      asset: market.base,
      currency: market.quote,
      min_size: market.limits.amount.min.toFixed(market.precision.amount),
      min_total: market.limits.cost.min.toString(),
      increment: Math.pow(10, -market.precision.price).toFixed(market.precision.price),
      label: market.base + '/' + market.quote
    }
  })

  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
