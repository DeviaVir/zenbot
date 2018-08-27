#!/usr/bin/env node
let ccxt = require('ccxt')

new ccxt.binance().fetch_markets().then(function(markets) {
  var products = []

  markets.forEach(function (market) {
    var currStepSize = market.info.filters[0].tickSize
    for (i = currStepSize.length - 1; i > 0; i--) {
      if (currStepSize[i] === '0')
        currStepSize = currStepSize.slice(0, i)
      else
        break;
    }

    var assetStepSize = market.info.filters[1].stepSize
    for (i = assetStepSize.length - 1; i > 0; i--) {
      if (assetStepSize[i] === '0')
        assetStepSize = assetStepSize.slice(0, i)
      else
        break
    }

    var min_size    = Number(market.info.filters[1].minQty);
    var minNotional = Number(market.info.filters[2].minNotional);
    // Orders must be strictly greater than minNotional
    if (min_size <= minNotional) {
      min_size += Number(assetStepSize);
    }
    min_size = min_size.toString();

    products.push({
      id: market.id,
      asset: market.base,
      currency: market.quote,
      min_size: min_size,
      max_size: market.info.filters[1].maxQty,
      increment: currStepSize,
      asset_increment: assetStepSize,
      label: market.base + '/' + market.quote
    })
  })

  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
