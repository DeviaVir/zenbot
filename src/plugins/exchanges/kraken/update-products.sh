#!/usr/bin/env node

var KrakenClient = require('kraken-api')
var kraken = new KrakenClient()

var mapping
var products = []

function addProduct(base, quote, altname) {
  var min_size = '0.01'
  switch (base) {
  case 'XREP':
    min_size = '0.3'
    break;
  case 'XBT':
    min_size = '0.002'
    break;
  case 'BCH':
    min_size = '0.002'
    break;
  case 'DASH':
    min_size = '0.03'
    break;
  case 'EOS':
    min_size = '3.0'
    break;
  case 'XETH':
    min_size = '0.02'
    break;
  case 'XETC':
    min_size = '0.3'
    break;
  case 'GNO':
    min_size = '0.03'
    break;
  case 'XICN':
    min_size = '2.0'
    break;
  case 'XLTC':
    min_size = '0.1'
    break;
  case 'XMLN':
    min_size = '0.1'
    break;
  case 'XLTC':
    min_size = '0.1'
    break;
  case 'XXMR':
    min_size = '0.1'
    break;
  case 'XXRP':
    min_size = '30'
    break;
  case 'XXLM':
    min_size = '300'
    break;
  case 'XZEC':
    min_size = '0.03'
    break;
  case 'USDT':
    min_size = '5'
    break;
  default:
    break;
  }
  products.push({
    asset: base,
    currency: quote,
    min_size: min_size,
    increment: '0.01',
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
