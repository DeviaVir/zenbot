var request = require('micro-request')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return function record_trades (product_id, limit, cb) {
    var x = require('./exchange.json')
    var rs = get('run_state')
    var uri = x.rest_url + '/products/' + product_id + '/trades?limit=' + Math.min(limit, 100) + (rs.gdax_recorder_id ? '&before=' + rs.gdax_recorder_id : '')
    //get('console').info('GET', uri)
    request(uri, {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
      if (err) return cb(err)
      if (resp.statusCode !== 200 || toString.call(trades) !== '[object Array]') {
        console.error(trades)
        return cb(new Error('non-200 status: ' + resp.statusCode))
      }
      trades = trades.map(function (trade) {
        rs.gdax_recorder_id = rs.gdax_recorder_id ? Math.max(rs.gdax_recorder_id, trade.trade_id) : trade.trade_id
        return {
          id: String(trade.trade_id),
          time: new Date(trade.time).getTime(),
          size: n(trade.size).value(),
          price: n(trade.price).value(),
          side: trade.side
        }
      })
      cb(null, trades)
    })
  }
}