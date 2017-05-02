var request = require('micro-request')

module.exports = function container (get, set, clear) {
  var rest_url = 'https://api.gdax.com'
  var c = get('conf')
  return {
    name: 'gdax',

    getProducts: function (cb) {
      request(rest_url + '/products', {headers: {'User-Agent': USER_AGENT}, timeout: c.request_timeout}, function (err, resp, body) {
        if (err) return cb(err)
        var products = []
        body.forEach(function (product) {
          products.push({
            id: product.id,
            asset: product.base_currency,
            currency: product.quote_currency,
            min_size: Number(product.base_min_size),
            max_size: Number(product.base_max_size),
            increment: Number(product.quote_increment),
            label: product.display_name
          })
        })
        cb(null, products)
      })
    },

    getTrades: function (opts, cb) {
      var uri = rest_url + '/products/' + opts.product_id + '/trades'
      if (opts.from) {
        uri += '?before=' + opts.from
      }
      else if (opts.to) {
        uri += '?after=' + opts.to
      }
      //console.log('uri', uri)
      request(uri, {headers: {'User-Agent': USER_AGENT}, timeout: c.request_timeout}, function (err, resp, body) {
        if (err) return cb(err)
        if (resp.statusCode !== 200 || toString.call(body) !== '[object Array]') {
          console.error(body)
          var err = new Error('non-200 status: ' + resp.statusCode)
          err.code = 'HTTP_STATUS'
          return cb(err)
        }
        var trades = body.map(function (trade) {
          return {
            trade_id: trade.trade_id,
            time: new Date(trade.time).getTime(),
            size: Number(trade.size),
            price: Number(trade.price),
            side: trade.side
          }
        })
        cb(null, trades)
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return trade.trade_id
    }
  }
}