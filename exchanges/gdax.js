var request = require('micro-request')
  , c = require('../conf/constants.json')
  , n = require('numbro')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var cached_pairs
  var series = get('motley:vendor.run-series')
  return {
    get_pairs: function (cb) {
      if (cached_pairs) return cb(null, cached_pairs)
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
        cached_pairs = pairs
        cb(null, pairs)
      })
    },
    record_trades: function (rs, cb) {
      var x = rs.gdax ? rs.gdax : {}
      rs.gdax = x
      var results = []
      this.get_pairs(function (err, pairs) {
        if (err) return cb(err)
        var tasks = Object.keys(pairs).map(function (id) {
          if (!x[id]) {
            x[id] = {}
          }
          return function (done) {
            request(c.gdax_rest_url + '/products/' + pairs[id].id + '/trades?limit=' + Math.min(c.backfill_limit, 100) + (x[id].max_trade_id ? '&before=' + rs.gdax_max_trade_id : ''), {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
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
              results = results.concat(trades)
              done(null, trades)
            })
          }
        })
        parallel(tasks, function (err) {
          if (err) return cb(err)
          cb(null, results)
        })
      })
    },
    backfill_trades: function (rs, cb) {
      var x = rs.gdax ? rs.gdax : {}
      rs.gdax = x
      var results = []
      this.get_pairs(function (err, pairs) {
        if (err) return cb(err)
        var tasks = Object.keys(pairs).map(function (id) {
          if (!x[id]) {
            x[id] = {}
          }
          return function (done) {
            request(c.gdax_rest_url + '/products/' + pairs[id].id + '/trades?limit=' + Math.min(c.backfill_limit, 100) + (x[id].min_trade_id ? '&after=' + x[id].min_trade_id : ''), {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
              if (err) return done(err)
              if (resp.statusCode !== 200 || toString.call(trades) !== '[object Array]') {
                console.error(trades)
                return done(new Error('non-200 status: ' + resp.statusCode))
              }
              if (!trades.length) {
                return done(null, [])
              }
              var orig_min_trade_id = x[id].min_trade_id
              trades = trades.map(function (trade) {
                x[id].min_trade_id = x[id].min_trade_id ? Math.min(x[id].min_trade_id, trade.trade_id) : trade.trade_id
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
              if (rs.gdax_min_trade_id === orig_min_trade_id) {
                return done(null, [])
              }
              results = results.concat(trades)
              done(null, trades)
            })
          }
        })
        parallel(tasks, function (err) {
          if (err) return cb(err)
          cb(null, results)
        })
      })
    }
  }
}