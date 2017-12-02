#!/usr/bin/env node

var bittrex = require('node.bittrex.api')

var mapping
var products = []

function addProduct(base, quote, minSize, altname) {
    products.push({
        asset: quote,
        currency: base,
        min_size: minSize,
        min_total: '0.0005',
        max_size: '1000000',
        increment: '0.00000001',
        label: base + '/' + quote
    })
}

bittrex.getmarkets(function (data) {
    if(typeof data !== 'object') {
        console.log('bittrex API had an abnormal response, quitting.')
        process.exit(1)
    }
    if('error' in data || !data.success) {
        console.log(data.error)
        console.log(data.message)
        process.exit(1)
    }
    else {
        mapping = data.result

        mapping = data.result

        Object.keys(data.result).forEach(function (result) {
            addProduct(data.result[result].BaseCurrency, data.result[result].MarketCurrency, data.result[result].MinTradeSize.toFixed(8), data.result[result].altname)
        })
        var target = require('path').resolve(__dirname, 'products.json')
        require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
        console.log('wrote', target)
        process.exit()
    }
})
