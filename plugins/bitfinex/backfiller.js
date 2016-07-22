var request = require('micro-request')
  , c = require('../../constants.json')
  , n = require('numbro')
  , parallel = require('run-parallel')
  , sig = require('sig')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var cached_pairs
  return {
    get_pairs: function (cb) {
      if (cached_pairs) return cb(null, cached_pairs)
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
            if (currency !== c.currency) return
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
        cached_pairs = pairs
        cb(null, pairs)
      })
    },
    record_trades: function (rs, cb) {
      var x = rs.bitfinex ? rs.bitfinex : {}
      rs.bitfinex = x
      //console.error('bitfinex record trades', x)
      var results = []
      this.get_pairs(function (err, pairs) {
        if (err) return cb(err)
        var tasks = Object.keys(pairs).map(function (id) {
          if (!x[id]) {
            x[id] = {
              hashes: {}
            }
          }
          return function (done) {
            var uri = c.bitfinex_rest_url + '/trades/' + id + '?limit_trades=' + c.backfill_limit + (x[id].max_timestamp ? '&timestamp=' + x[id].max_timestamp : '')
            //get('console').info('GET', uri)
            request(uri, {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
              if (err) return done(err)
              if (resp.statusCode !== 200 || toString.call(trades) !== '[object Array]') {
                console.error(trades)
                return done(new Error('non-200 status: ' + resp.statusCode))
              }
              if (!trades.length) {
                return done(null, [])
              }
              var hash = sig(trades)
              if (x[id].hashes[hash]) {
                //get('console').error('DUPE', uri, hash, trades.length, 'trades')
                return cb && cb(null, [])
              }
              x[id].hashes[hash] = true
              //get('console').info('GET', uri, hash, trades.length, 'trades')
              var orig_max_timestamp = x[id].max_timestamp
              trades = trades.map(function (trade) {
                x[id].max_timestamp = x[id].max_timestamp ? Math.max(x[id].max_timestamp, trade.timestamp) : trade.timestamp
                assert(!Number.isNaN(x[id].max_timestamp))
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
              if (x[id].max_timestamp === orig_max_timestamp) {
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
      // bitfinex doesn't offer historical trade api.
      // @todo: backfill from another zenbot instance using server
      cb(null, [])
    }
  }
}
