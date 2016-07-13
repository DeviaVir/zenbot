var request = require('micro-request')
  , c = require('../conf/constants.json')
  , n = require('numbro')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  return {
    get_pairs: function (cb) {
      var pairs = {}
      request(c.gdax_rest_url + '/products', {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, products) {
        if (err) return cb(err)
        if (resp.statusCode !== 200 || toString.call(products) !== '[object Array]') {
          console.error(products)
          return cb(new Error('non-200 status: ' + resp.statusCode))
        }
        products.forEach(function (product) {
          if (product.base_currency === c.asset) {
            product.display = product.id
            pairs[product.id] = product
          }
        })
        cb(null, pairs)
      })
    },
    record_trades: function (rs, cb) {
      if (!rs.gdax_max_trade_id) rs.gdax_max_trade_id = ''
      this.get_pairs(function (err, pairs) {
        if (err) return cb(err)
        var tasks = Object.keys(pairs).map(function (id) {
          return function (done) {
            request(c.gdax_rest_url + '/products/' + pairs[id].id + '/trades' + (rs.gdax_max_trade_id ? '?before=' + rs.gdax_max_trade_id : ''), {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
              if (err) return done(err)
              if (resp.statusCode !== 200 || toString.call(trades) !== '[object Array]') {
                console.error(trades)
                return done(new Error('non-200 status: ' + resp.statusCode))
              }
              if (!trades.length) {
                return done(null, [])
              }
              var orig_max_trade_id = rs.gdax_max_trade_id
              trades = trades.map(function (trade) {
                rs.gdax_max_trade_id = Math.max(rs.gdax_max_trade_id, trade.trade_id)
                return {
                  id: 'gdax-' + pairs[id].display + '-' + String(trade.trade_id),
                  asset: pairs[id].base_currency,
                  currency: pairs[id].quote_currency,
                  time: new Date(trade.time).getTime(),
                  size: n(trade.size).value(),
                  price: n(trade.price).value(),
                  side: trade.side,
                  exchange: 'gdax'
                }
              })
              if (rs.gdax_max_trade_id === orig_max_trade_id) {
                return done(null, [])
              }
              done(null, trades)
            })
          }
        })
        parallel(tasks, function (err, results) {
          if (err) return cb(err)
          results = [].concat.call([], results)
          cb(null, results)
        })
      })
    },
    backfill_trades: function (rs, cb) {

    }
  }
}