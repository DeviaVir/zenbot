var request = require('micro-request')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.gdax')
  var log_trades = get('utils.log_trades')
  var get_products = get('utils.get_products')
  var map = get('map')
  return function mapper () {
    var c = get('config')
    var products = get_products(x)
    var options = get('options')
    if (!products.length) return
    var rs = get('run_state')
    rs[x.name] || (rs[x.name] = {})
    rs = rs[x.name]
    products.forEach(function (product) {
      rs[product.id] || (rs[product.id] = {})
      var s = rs[product.id]
      function retry () {
        setTimeout(getNext, c.record_timeout)
      }
      function getNext () {
        function withResult (result) {
          var trades = result.map(function (trade) {
            s.recorder_id = s.recorder_id ? Math.max(s.recorder_id, trade.trade_id) : trade.trade_id
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
          retry()
        }
        var uri = x.rest_url + '/products/' + product.id + '/trades' + (s.recorder_id ? '?before=' + s.recorder_id : '')
        //get('logger').info(z(c.max_slug_length, 'recorder GET', ' '), uri.grey)
        request(uri, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
          if (err) {
            get('logger').error(x.name + ' recorder err', err, {public: false})
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
