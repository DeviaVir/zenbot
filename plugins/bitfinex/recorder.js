var request = require('micro-request')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.bitfinex')
  var c = get('config')
  var log_trades = get('utils.log_trades')
  var get_products = get('utils.get_products')
  var map = get('map')
  return function mapper () {
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
        setTimeout(getNext, x.record_timeout)
      }
      function getNext () {
        function withResult (result) {
          var trades = result.map(function (trade) {
            s.recorder_id = s.recorder_id ? Math.max(s.recorder_id, trade.timestamp) : trade.timestamp
            var obj = {
              id: x.name + '-' + String(trade.tid),
              time: n(trade.timestamp).multiply(1000).value(),
              asset: product.asset,
              currency: product.currency,
              size: n(trade.amount).value(),
              price: n(trade.price).value(),
              side: trade.type,
              exchange: x.name
            }
            map('trade', obj)
            return obj
          })
          log_trades(x.name, trades)
          retry()
        }
        var uri = x.rest_url + '/trades/' + product.id + (rs.recorder_id ? '?timestamp=' + rs.recorder_id : '')
        get('logger').info(x.name, uri.grey)
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
          console.error('result', result)
          withResult(result)
        })
      }
      getNext()
    })
  }
}