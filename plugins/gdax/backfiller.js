var request = require('micro-request')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.gdax')
  var c = get('config')
  var log_trades = get('utils.log_trades')
  var backfill_status = get('utils.backfill_status')
  var product_id
  var map = get('map')
  x.products.forEach(function (product) {
    if (product.asset === c.asset && product.currency === c.currency) {
      product_id = product.id
    }
  })
  return function mapper () {
    if (!product_id) return function () {}
    function retry () {
      var timeout = setTimeout(mapper, x.backfill_interval)
      set('timeouts[]', timeout)
    }
    var rs = get('run_state')
    var uri = x.rest_url + '/products/' + product_id + '/trades?limit=' + x.backfill_limit + (rs.gdax_backfiller_id ? '&after=' + rs.gdax_backfiller_id : '')
    //get('console').info('GET', uri)
    request(uri, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
      if (err) {
        get('logger').error('gdax backfiller err', err, {feed: 'errors'})
        return retry()
      }
      if (resp.statusCode !== 200 || toString.call(result) !== '[object Array]') {
        console.error(result)
        get('logger').error('gdax non-200 status: ' + resp.statusCode, {feed: 'errors'})
        return retry()
      }
      var trades = result.map(function (trade) {
        rs.gdax_backfiller_id = rs.gdax_backfiller_id ? Math.min(rs.gdax_backfiller_id, trade.trade_id) : trade.trade_id
        var obj = {
          id: x.name + '-' + String(trade.trade_id),
          time: new Date(trade.time).getTime(),
          size: n(trade.size).value(),
          price: n(trade.price).value(),
          side: trade.side,
          exchange: x.name
        }
        map('trade', obj)
        return obj
      })
      log_trades(x.name + ' backfiller', trades)
      backfill_status(x, retry)
    })
  }
}