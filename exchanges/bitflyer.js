// https://lightning.bitflyer.jp/docs?lang=en#execution-history
// https://api.bitflyer.jp/v1/getexecutions?product_code=BTC_JPY

var request = require('micro-request')
  , c = require('../conf/constants.json')
  , n = require('numbro')
  , parallel = require('run-parallel')
  , sig = require('sig')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var series = get('motley:vendor.run-series')
  return {
    get_pairs: function (cb) {
      var pairs = {}
      if (c.asset === 'BTC' && c.currency === 'JPY') {
        pairs['BTC_JPY'] = {
          display: 'BTC-JPY',
          base_currency: 'BTC',
          quote_currency: 'JPY'
        }
        pairs['FX_BTC_JPY'] = {
          display: 'FX-BTC-JPY',
          base_currency: 'BTC',
          quote_currency: 'JPY'
        }
      }
      else if (c.asset === 'ETH' && c.currency === 'BTC') {
        pairs['ETH_BTC'] = {
          display: 'ETH-BTC',
          base_currency: 'ETH',
          quote_currency: 'BTC'
        }
      }
      cb(null, pairs)
    },
    record_trades: function (rs, cb) {
      var x = rs.bitflyer ? rs.bitflyer : {}
      rs.bitflyer = x
      var results = []
      //console.error('bitflyer record trades', x)
      this.get_pairs(function (err, pairs) {
        if (err) return cb(err)
        var tasks = Object.keys(pairs).map(function (id) {
          if (!x[id]) {
            x[id] = {
              hashes: {}
            }
          }
          return function (done) {
            var uri = c.bitflyer_rest_url + '/getexecutions?count=' + c.backfill_limit + '&product_code=' + id + (x[id].max_id ? '&after=' + x[id].max_id : '')
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
              var orig_max_id = x[id].max_id
              trades = trades.map(function (trade) {
                x[id].max_id = x[id].max_id ? Math.max(x[id].max_id, trade.id) : trade.id
                assert(!Number.isNaN(x[id].max_id))
                return {
                  id: 'bitflyer-' + pairs[id].display + '-' + String(trade.id),
                  currency: pairs[id].quote_currency,
                  asset: pairs[id].base_currency,
                  time: new Date(trade.exec_date).getTime(),
                  size: n(trade.size).value(),
                  price: n(trade.price).value(),
                  side: trade.side.toLowerCase(),
                  exchange: 'bitflyer'
                }
              })
              if (x[id].max_id === orig_max_id) {
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
      var x = rs.bitflyer ? rs.bitflyer : {}
      rs.bitflyer = x
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
            var uri = c.bitflyer_rest_url + '/getexecutions?count=' + c.backfill_limit + '&product_code=' + id + (x[id].min_id ? '&before=' + x[id].min_id : '')
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
              var orig_min_id = x[id].min_id
              trades = trades.map(function (trade) {
                x[id].min_id = x[id].min_id ? Math.min(x[id].min_id, trade.id) : trade.id
                assert(!Number.isNaN(x[id].min_id))
                return {
                  id: 'bitflyer-' + pairs[id].display + '-' + String(trade.id),
                  currency: pairs[id].quote_currency,
                  asset: pairs[id].base_currency,
                  time: new Date(trade.exec_date).getTime(),
                  size: n(trade.size).value(),
                  price: n(trade.price).value(),
                  side: trade.side.toLowerCase(),
                  exchange: 'bitflyer'
                }
              })
              if (x[id].min_id === orig_min_id) {
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
