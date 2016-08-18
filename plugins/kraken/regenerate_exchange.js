'use strict'

const fs = require('fs')
const axios = require('axios')

function generate_json(products) {
  return {
    "name": "kraken",
    "rest_url": "https://api.kraken.com/0",
    "backfill_timeout": 5000,
    "products": [
      ...products
    ]
  }
}

function get_products() {
  const products = axios.get('https://api.kraken.com/0/public/AssetPairs')
    .then(res => {
      const items = res.data.result

      const products = Object.keys(items).map(key => {
        if (key.length === 8) {
          const id1 = key.slice(0, 4)
          const id2 = key.slice(4, 8)
          // NOTE: to map min/max size from API data
          return {
            "id": id1 + id2,
            "asset": id1,
            "currency": id2,
            "min_size": 0.01,
            "max_size": 10000,
            "increment": 0.01,
            "label": id1 + '/' + id2
          }
        } else {
          // unsupported pairs
          return false
        }
      })

      return products
    })
    .then(products => {
      const cleaned_products = products.filter(p => p !== false)
      return cleaned_products
    })
    .catch(err => {
      console.log(err)
    })

  return products
}


get_products()
  .then(products => {
    // console.log(generate_json(products))
    const output_string = JSON.stringify(generate_json(products), null, 2)
    fs.writeFileSync('exchange.json', output_string, 'utf8')
  })