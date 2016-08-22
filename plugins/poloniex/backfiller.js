var request = require('micro-request')
  , n = require('numbro')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.poloniex')
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
      function retry () {
        setTimeout(getNext, c.backfill_timeout)
      }
      function getNext () {
        function withResult (result) {
          var trades = result.map(function (trade) {
            var ts = new Date(trade.date + ' GMT').getTime()
            var ts_s = n(ts).divide(1000).value()
            s.backfiller_id = s.backfiller_id ? Math.min(s.backfiller_id, ts_s) : ts_s
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
          if (is_backfilled(trades)) {
            get('logger').info(x.name, (product.asset + '/' + product.currency + ' backfill complete').grey)
          }
          else {
            retry()
          }
        }
        var uri = x.rest_url
        var query = {
          command: 'returnTradeHistory',
          currencyPair: product.id,
          start: Math.round(tb().resize('1h').subtract(2).toMilliseconds() / 1000)
        }
        if (s.backfiller_id) {
          query.end = s.backfiller_id
          query.start = Math.round(tb('s', s.backfiller_id).resize('1h').subtract(2).toMilliseconds() / 1000)
        }
        //get('logger').info(x.name, query, uri.grey)
        request(uri, {query: query, headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
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