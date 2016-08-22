var request = require('micro-request')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.bitfinex')
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
            var ts
            // normal trades
            if (trade.timestamp) {
              ts = n(trade.timestamp).multiply(1000).value()
            }
            // system-created trades
            else if (trade.created_at) {
              ts = new Date(trade.created_at).getTime()
            }
            var ts_s = Math.floor(n(ts).divide(1000).value())
            s.recorder_id = s.recorder_id ? Math.max(s.recorder_id, ts_s) : ts_s
            var obj = {
              id: x.name + '-' + String(trade.id),
              time: ts,
              asset: product.asset,
              currency: product.currency,
              size: n(trade.amount).value(),
              price: n(trade.price).value(),
              side: trade.side ? 'sell' : 'buy',
              exchange: x.name
            }
            map('trade', obj)
            return obj
          })
          log_trades(x.name, trades)
          retry()
        }
        var uri = x.rest_url + '/trades/' + product.id + (s.recorder_id ? '?timestamp=' + s.recorder_id : '')
        //get('logger').info(x.name, uri.grey)
        request(uri, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
          if (err) {
            get('logger').error(x.name + ' recorder err', err, {public: false})
            return retry()
          }
          if (resp.statusCode !== 200 || toString.call(result) !== '[object Array]') {
            //console.error(result)
            get('logger').error(x.name + ' non-200 status: ' + resp.statusCode, {feed: 'errors'})
            return retry()
          }
          //console.error('result', result)
          withResult(result)
        })
      }
      getNext()
    })
  }
}