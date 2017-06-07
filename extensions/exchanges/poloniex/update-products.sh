#!/usr/bin/env node
var request = require('micro-request')
request('https://poloniex.com/public?command=returnTicker', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, ticker) {
  if (err) throw err
  if (resp.statusCode !== 200) {
    var err = new Error('non-200 status: ' + resp.statusCode)
    err.code = 'HTTP_STATUS'
    err.body = body
    console.error(err)
    process.exit(1)
  }
  request('https://poloniex.com/public?command=returnCurrencies', {headers: {'User-Agent': 'zenbot/4'}}, function (err, resp, currencies) {
    if (err) throw err
    if (resp.statusCode !== 200) {
      var err = new Error('non-200 status: ' + resp.statusCode)
      err.code = 'HTTP_STATUS'
      err.body = body
      console.error(err)
      process.exit(1)
    }
    var products = []
    Object.keys(ticker).forEach(function (pair) {
      var asset = pair.split('_')[1], currency = pair.split('_')[0]
      products.push({
        asset: asset,
        currency: currency,
        min_total: '0.0001',
        max_size: null,
        increment: '0.00000001',
        label: currencies[asset].name + '/' + currencies[currency].name
      })
    })
    products.sort(function (a, b) {
      if (a.asset < b.asset) return -1
      if (a.asset > b.asset) return 1
      if (a.currency < b.currency) return -1
      if (a.currency > b.currency) return 1
      return 0
    })
    var target = require('path').resolve(__dirname, 'products.json')
    require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
    console.log('wrote', target)
    process.exit()
  })
})