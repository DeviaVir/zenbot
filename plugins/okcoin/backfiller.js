// https://www.okcoin.com/api/v1/trades.do?since=5000
// https://www.okcoin.com/about/rest_api.do#stapi

var request = require('micro-request')
  , c = require('../conf/constants.json')
  , n = require('numbro')
  , parallel = require('run-parallel')
  , sig = require('sig')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var cached_pairs
  var series = get('motley:vendor.run-series')
  return {
    get_pairs: function (cb) {
      var pairs = {}
      if (c.asset == 'BTC') {
        if (c.currency === 'CNY') {
          pairs['btc_cny'] = {
            display: 'BTC-CNY',
            base_currency: 'BTC',
            quote_currency: 'CNY',
            url: c.okcoin_cny_rest_url
          }
        }
        else if (c.currency === 'USD') {
          pairs['btc_usd'] = {
            display: 'BTC-USD',
            base_currency: 'BTC',
            quote_currency: 'USD',
            url: c.okcoin_usd_rest_url
          }
        }
      }
      else if (c.asset === 'LTC') {
        if (c.currency === 'CNY') {
          pairs['ltc_cny'] = {
            display: 'LTC-CNY',
            base_currency: 'LTC',
            quote_currency: 'CNY',
            url: c.okcoin_cny_rest_url
          }
        }
        else if (c.currency === 'USD') {
          pairs['ltc_usd'] = {
            display: 'LTC-USD',
            base_currency: 'LTC',
            quote_currency: 'USD',
            url: c.okcoin_usd_rest_url
          }
        }
      }
      cb(null, pairs)
    },
    record_trades: function (rs, cb) {
      var x = rs.okcoin ? rs.okcoin : {}
      rs.okcoin = x
      //console.error('okcoin record trades', x)
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
            var uri = pairs[id].url + '/trades.do?symbol=' + id + (x[id].max_trade_id ? '&since=' + x[id].max_trade_id : '')
            //get('console').info('GET', uri)
            request(uri, {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
              if (err) return done(err)
              try {
                trades = JSON.parse(trades)
              }
              catch (e) {
                return done(e)
              }
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
              var orig_max_trade_id = x[id].max_trade_id
              trades = trades.map(function (trade) {
                x[id].max_trade_id = x[id].max_trade_id ? Math.max(x[id].max_trade_id, trade.tid) : trade.tid
                assert(!Number.isNaN(x[id].max_trade_id))
                return {
                  id: 'okcoin-' + pairs[id].display + '-' + String(trade.tid),
                  asset: pairs[id].base_currency,
                  currency: pairs[id].quote_currency,
                  time: n(trade.date_ms).value(),
                  size: n(trade.amount).value(),
                  price: n(trade.price).value(),
                  side: trade.type,
                  exchange: 'okcoin'
                }
              })
              if (x[id].max_trade_id === orig_max_trade_id) {
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
      // okcoin doesn't offer historical trade api.
      // @todo: backfill from another zenbot instance using server
      cb(null, [])
    }
  }
}