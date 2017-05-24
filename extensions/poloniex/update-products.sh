#!/usr/bin/env node
var request = require('micro-request')
request('https://poloniex.com/public?command=returnCurrencies', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, body) {
  if (err) throw err
  if (resp.statusCode !== 200) {
    var err = new Error('non-200 status: ' + resp.statusCode)
    err.code = 'HTTP_STATUS'
    err.body = body
    console.error(err)
    process.exit(1)
  }
  var products = []
  function addProduct (asset, currency) {
    products.push({
      asset: asset,
      currency: currency,
      min_total: '0.0001',
      max_size: null,
      increment: '0.00000001',
      label: body[asset].name + '/' + currency
    })
  }
  Object.keys(body).forEach(function (asset) {
    if (!body[asset].delisted) {
      addProduct(asset, 'BTC')
      if (asset.match(/^GNT|ETC|STEEM|ZEC|GNO|REP|LSK$/)) {
        addProduct(asset, 'ETH')
      }
      if (asset.match(/^LTC|DASH|BCN|ZEC|NXT|MAID|BTCD|BLK$/)) {
        addProduct(asset, 'XMR')
      }
      if (asset.match(/^BTC|XRP|LTC|ETH|STR|ETC|NXT|XMR|DASH|ZEC|REP$/)) {
        addProduct(asset, 'USDT')
      }
    }
  })
  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})