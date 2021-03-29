#!/usr/bin/env node
let ccxt = require('ccxt')

new ccxt.binanceus().fetch_markets().then(function(markets) {
  var products = []

  var products = markets.map(function (market) {
    const filters = market.info.filters
    const price_filter = filters.find(f => f.filterType === 'PRICE_FILTER')
    const lot_size_filter = filters.find(f => f.filterType === 'LOT_SIZE')
    const notional_filter = filters.find(f => f.filterType === 'MIN_NOTIONAL')

    // NOTE: price_filter also contains minPrice and maxPrice
    return {
      id: market.id,
      asset: market.base,
      currency: market.quote,
      min_size: lot_size_filter.minQty,
      max_size: lot_size_filter.maxQty,
      min_total: notional_filter.minNotional,
      increment: price_filter.tickSize,
      asset_increment: lot_size_filter.stepSize,
      label: market.base + '/' + market.quote
    }
  })

  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
