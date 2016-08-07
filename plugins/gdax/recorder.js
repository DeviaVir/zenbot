var request = require('micro-request')
  , n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.gdax')
  var c = get('config')
  var log_trades = get('utils.log_trades')
  var product_id
  var map = get('map')
  x.products.forEach(function (product) {
    if (product.asset === c.asset && product.currency === c.currency) {
      product_id = product.id
    }
  })
  return function mapper () {
    if (!product_id) return
    function retry () {
      setTimeout(mapper, c.record_timeout)
    }
    var rs = get('run_state')
    var uri = x.rest_url + '/products/' + product_id + '/trades' + (rs.gdax_recorder_id ? '?before=' + rs.gdax_recorder_id : '')
    //get('logger').info(z(c.max_slug_length, 'recorder GET', ' '), uri.grey)
    request(uri, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
      if (err) {
        get('logger').error('gdax recorder err', err, {public: false})
        return retry()
      }
      if (resp.statusCode !== 200 || toString.call(result) !== '[object Array]') {
        console.error(result)
        get('logger').error('gdax non-200 status: ' + resp.statusCode, {feed: 'errors'})
        return retry()
      }
      var trades = result.map(function (trade) {
        rs.gdax_recorder_id = rs.gdax_recorder_id ? Math.max(rs.gdax_recorder_id, trade.trade_id) : trade.trade_id
        var obj = {
          id: x.name + '-' + String(trade.trade_id),
          trade_id: trade.trade_id,
          time: new Date(trade.time).getTime(),
          size: n(trade.size).value(),
          price: n(trade.price).value(),
          side: trade.side,
          exchange: x.name
        }
        map('trade', obj)
        return obj
      })
      //log_trades(x.name, trades)
      retry()
    })
  }
}