var request = require('micro-request')
  , c = require('../conf/constants.json')
  , n = require('numbro')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  return {
    get_pairs: function (cb) {
      var pairs = {}
      request(c.bitfinex_rest_url + '/symbols_details', {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, symbols) {
        if (err) return cb(err)
        if (resp.statusCode !== 200 || toString.call(symbols) !== '[object Array]') {
          console.error(symbols)
          return cb(new Error('non-200 status: ' + resp.statusCode))
        }
        symbols.forEach(function (symb) {
          var idx = symb.pair.indexOf(c.asset.toLowerCase())
          var asset, currency
          if (idx === 0) {
            asset = c.asset
            currency = symb.pair.substr(3).toUpperCase()
          }
          else {
            return
          }
          pairs[symb.pair] = {
            display: asset + '-' + currency,
            base_currency: asset,
            quote_currency: currency,
            base_min_size: n(symb.minimum_order_size).value(),
            base_max_size: n(symb.maximum_order_size).value(),
            quote_increment: null
          }
        })
        cb(null, pairs)
      })
    },
    record_trades: function (rs, cb) {
      if (!rs.bitfinex_max_timestamp) rs.bitfinex_max_timestamp = ''
      this.get_pairs(function (err, pairs) {
        if (err) return cb(err)
        var tasks = Object.keys(pairs).map(function (id) {
          return function (done) {
            request(c.bitfinex_rest_url + '/trades/' + id + '?timestamp=' + rs.bitfinex_max_timestamp, {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
              if (err) return done(err)
              if (resp.statusCode !== 200 || toString.call(trades) !== '[object Array]') {
                console.error(trades)
                return done(new Error('non-200 status: ' + resp.statusCode))
              }
              if (!trades.length) {
                return done(null, [])
              }
              var orig_max_timestamp = rs.bitfinex_max_timestamp
              trades = trades.map(function (trade) {
                rs.bitfinex_max_timestamp = Math.max(rs.bitfinex_max_timestamp, trade.timestamp)
                return {
                  id: 'bitfinex-' + pairs[id].display + '-' + String(trade.tid),
                  currency: pairs[id].quote_currency,
                  asset: pairs[id].base_currency,
                  time: n(trade.timestamp).multiply(1000).value(),
                  size: n(trade.amount).value(),
                  price: n(trade.price).value(),
                  side: trade.type,
                  exchange: trade.exchange
                }
              })
              if (rs.bitfinex_max_timestamp === orig_max_timestamp) {
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
