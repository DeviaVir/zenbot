// https://lightning.bitflyer.jp/docs?lang=en#execution-history
// https://api.bitflyer.jp/v1/getexecutions?product_code=BTC_JPY

var request = require('micro-request')
  , c = require('../conf/constants.json')
  , n = require('numbro')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var series = get('motley:vendor.run-series')
  return {
    get_pairs: function (cb) {
      var pairs = {
        'BTC_JPY': {
          display: 'BTC-JPY',
          base_currency: 'BTC',
          quote_currency: 'JPY'
        },
        'FX_BTC_JPY': {
          display: 'FX-BTC-JPY',
          base_currency: 'BTC',
          quote_currency: 'JPY'
        },
        'ETH_BTC': {
          display: 'ETH-BTC',
          base_currency: 'ETH',
          quote_currency: 'BTC'
        }
      }
      cb(null, pairs)
    },
    record_trades: function (rs, cb) {
      if (!rs.bitflyer_max_id) rs.bitflyer_max_id = ''
      this.get_pairs(function (err, pairs) {
        if (err) return cb(err)
        var tasks = Object.keys(pairs).map(function (id) {
          return function (done) {
            request(c.bitflyer_rest_url + '/getexecutions?product_code=' + id + (rs.bitflyer_max_id ? '&after=' + rs.bitflyer_max_id : ''), {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
              if (err) return done(err)
              if (resp.statusCode !== 200 || toString.call(trades) !== '[object Array]') {
                console.error(trades)
                return done(new Error('non-200 status: ' + resp.statusCode))
              }
              if (!trades.length) {
                return done(null, [])
              }
              var orig_max_id = rs.bitflyer_max_id
              trades = trades.map(function (trade) {
                rs.bitflyer_max_id = Math.max(rs.bitflyer_max_id, trade.id)
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
              if (rs.bitflyer_max_id === orig_max_id) {
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
      if (!rs.bitflyer_min_id) rs.bitflyer_min_id = ''
      this.get_pairs(function (err, pairs) {
        if (err) return cb(err)
        var tasks = Object.keys(pairs).map(function (id) {
          return function (done) {
            request(c.bitflyer_rest_url + '/getexecutions?product_code=' + id + (rs.bitflyer_min_id ? '&before=' + rs.bitflyer_min_id : ''), {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
              if (err) return done(err)
              if (resp.statusCode !== 200 || toString.call(trades) !== '[object Array]') {
                console.error(trades)
                return done(new Error('non-200 status: ' + resp.statusCode))
              }
              if (!trades.length) {
                return done(null, [])
              }
              var orig_min_id = rs.bitflyer_min_id
              trades = trades.map(function (trade) {
                rs.bitflyer_min_id = rs.bitflyer_min_id ? Math.min(rs.bitflyer_min_id, trade.id) : trade.id
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
              if (rs.bitflyer_min_id === orig_min_id) {
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
    }
  }
}
