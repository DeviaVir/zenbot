var request = require('micro-request')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.gdax')
  var log_trades = get('utils.log_trades')
  var get_products = get('utils.get_products')
  var is_backfilled = get('utils.is_backfilled')
  var map = get('map')
  return function mapper () {
    var c = get('config')
    var products = get_products(x)
    var options = get('options')
    if (!options.backfill || !products.length) return
    var rs = get('run_state')
    rs[x.name] || (rs[x.name] = {})
    rs = rs[x.name]
    products.forEach(function (product) {
      rs[product.id] || (rs[product.id] = {})
      var s = rs[product.id]
      //s.backfiller_id = null // start from scratch
      function retry () {
        setTimeout(getNext, x.backfill_timeout)
      }
      function getNext () {
        function withResult (result) {
          var trades = result.map(function (trade) {
            s.backfiller_id = s.backfiller_id ? Math.min(s.backfiller_id, trade.trade_id) : trade.trade_id
            var obj = {
              id: x.name + '-' + String(trade.trade_id),
              trade_id: trade.trade_id,
              time: new Date(trade.time).getTime(),
              asset: product.asset,
              currency: product.currency,
              size: n(trade.size).value(),
              price: n(trade.price).value(),
              side: trade.side,
              exchange: x.name
            }
            map('trade', obj)
            return obj
          })
          log_trades(x.name, trades)
          if (is_backfilled(trades)) {
            get('logger').info(x.name, (product.asset + '/' + product.currency + ' backfill complete').grey)
          }
          else {
            retry()
          }
        }
        var uri = x.rest_url + '/products/' + product.id + '/trades?limit=' + x.backfill_limit + (s.backfiller_id ? '&after=' + s.backfiller_id : '')
        //get('logger').info(z(c.max_slug_length, 'backfiller GET', ' '), uri.grey)
        request(uri, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
          if (err) {
            get('logger').error(x.name + ' backfiller err', err, {feed: 'errors'})
            return retry()
          }
          if (resp.statusCode !== 200 || toString.call(result) !== '[object Array]') {
            console.error(result)
            get('logger').error(x.name + ' non-200 status: ' + resp.statusCode, {feed: 'errors'})
            return retry()
          }
          withResult(result)
        })
      }
      getNext()
    })
  }
}
