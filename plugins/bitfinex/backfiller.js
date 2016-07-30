var request = require('micro-request')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.bitfinex')
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
    // @todo: this code doesn't work. seems like bitfinex doesn't offer historical data.
    return
    if (!product_id) return
    function retry () {
      var timeout = setTimeout(mapper, x.backfill_interval)
      set('timeouts[]', timeout)
    }
    var rs = get('run_state')
    var uri = x.rest_url + '/trades/' + product_id + '?limit_trades=' + x.backfill_limit + (rs.bitfinex_min_timestamp ? '&timestamp=' + rs.bitfinex_min_timestamp : '')
    //get('console').info('GET', uri)
    request(uri, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
      if (err) return done(err)
      if (err) {
        get('logger').error(x.name + ' backfiller err', err, {feed: 'errors'})
        return retry()
      }
      if (resp.statusCode !== 200 || toString.call(result) !== '[object Array]') {
        console.error(result)
        get('logger').error(x.name + ' non-200 status: ' + resp.statusCode, {feed: 'errors'})
        return retry()
      }
      var trades = result.map(function (trade) {
        rs.bitfinex_min_timestamp = rs.bitfinex_min_timestamp ? Math.min(rs.bitfinex_min_timestamp, trade.timestamp) : trade.timestamp
        var obj = {
          id: x.name + '-' + String(trade.tid),
          time: n(trade.timestamp).multiply(1000).value(),
          size: n(trade.amount).value(),
          price: n(trade.price).value(),
          side: trade.type,
          exchange: trade.exchange
        }
        map('trade', obj)
        return obj
      })
      log_trades(x.name + ' backfiller', trades)
      backfill_status(retry)
    })
  }
}
