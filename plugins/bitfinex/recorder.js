var request = require('micro-request')
  , n = require('numbro')
  , parallel = require('run-parallel')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.bitfinex')
  var c = get('config')
  var log_trades = get('utils.log_trades')
  var product_id
  var map = get('map')
  var trade_ids = []
  x.products.forEach(function (product) {
    if (product.asset === c.asset && product.currency === c.currency) {
      product_id = product.id
    }
  })
  return function recorder () {
    if (!product_id) return
    function retry (ms) {
      setTimeout(recorder, x.record_interval)
    }
    var rs = get('run_state')
    var uri = x.rest_url + '/trades/' + product_id + (rs.bitfinex_max_timestamp ? '?timestamp=' + rs.bitfinex_max_timestamp : '')
    //get('logger').info(z(c.max_slug_length, 'GET', ' '), uri.grey)
    request(uri, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
      if (err) {
        get('logger').error(x.name + ' recorder err', err, {public: false})
        return retry()
      }
      if (resp.statusCode !== 200 || toString.call(result) !== '[object Array]') {
        console.error(result)
        get('logger').error(x.name + ' non-200 status: ' + resp.statusCode, {public: false})
        return retry()
      }
      var trades = result.map(function (trade) {
        rs.bitfinex_max_timestamp = rs.bitfinex_recorder_timestamp ? Math.max(rs.bitfinex_max_timestamp, trade.timestamp) : trade.timestamp
        var obj = {
          id: x.name + '-' + String(trade.tid),
          time: n(trade.timestamp).multiply(1000).value(),
          size: n(trade.amount).value(),
          price: n(trade.price).value(),
          side: trade.type,
          exchange: x.name
        }
        map('trade', obj)
        return obj
      }).filter(function (trade) {
        var is_new = trade_ids.indexOf(trade.id) === -1
        if (is_new) {
          trade_ids.push(trade.id)
        }
        return is_new
      })
      if (trades.length) {
        log_trades(x.name + ' recorder', trades)
      }
      retry()
    })
  }
}