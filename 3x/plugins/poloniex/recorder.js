var request = require('micro-request')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.poloniex')
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
            var ts = new Date(trade.date + ' GMT').getTime()
            var ts_s = n(ts).divide(1000).value()
            s.recorder_id = s.recorder_id ? Math.max(s.recorder_id, ts_s) : ts_s
            var obj = {
              id: x.name + '-' + String(trade.globalTradeID),
              trade_id: trade.globalTradeID,
              time: ts,
              asset: product.asset,
              currency: product.currency,
              size: n(trade.amount).value(),
              price: n(trade.rate).value(),
              side: trade.type,
              exchange: x.name
            }
            map('trade', obj)
            return obj
          })
          log_trades(x.name, trades)
          retry()
        }
        var uri = x.rest_url
        var query = {
          command: 'returnTradeHistory',
          currencyPair: product.id
        }
        if (s.recorder_id) {
          query.start = s.recorder_id
        }
        //get('logger').info(x.name, query, uri.grey)
        request(uri, {query: query, headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
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