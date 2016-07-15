var request = require('micro-request')
  , c = require('../conf/constants.json')
  , n = require('numbro')
  , parallel = require('run-parallel')
  , sig = require('sig')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.gdax')
  var rs = get('run_state')
  var 
  return function gdax_backfiller (product_id, done) {
    var uri = x.rest_url + '/products/' + product_id + '/trades?limit=' + Math.min(x.backfill_limit, 100) + (rs.min_trade_id ? '&after=' + x[id].min_trade_id : '')
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
      x[id].hashes[hash] = true
      //get('console').info('GET', uri, hash, trades.length, 'trades')
      var orig_min_trade_id = x[id].min_trade_id
      trades = trades.map(function (trade) {
        x[id].min_trade_id = x[id].min_trade_id ? Math.min(x[id].min_trade_id, trade.trade_id) : trade.trade_id
        assert(!Number.isNaN(x[id].min_trade_id))
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
      if (x[id].min_trade_id === orig_min_trade_id) {
        return done(null, [])
      }
      results = results.concat(trades)
      done(null, trades)
    })
  }
}