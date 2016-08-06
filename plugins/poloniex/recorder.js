var request = require('micro-request')
  , n = require('numbro')
  , z = require('zero-fill')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.poloniex')
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
      setTimeout(mapper, x.record_interval)
    }
    var rs = get('run_state')
    rs.poloniex || (rs.poloniex = {})
    rs = rs.poloniex
    var uri = x.rest_url
    var query = {
      command: 'returnTradeHistory',
      currencyPair: product_id
    }
    if (rs.recorder_id) {
      query.start = rs.recorder_id
    }
    //get('logger').info(z(c.max_slug_length, 'GET', ' '), uri.grey, query, {feed: 'recorder'})
    request(uri, {query: query, headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
      if (err) {
        get('logger').error('poloniex recorder err', err, {public: false})
        return retry()
      }
      if (resp.statusCode !== 200 || toString.call(result) !== '[object Array]') {
        console.error(result)
        get('logger').error('poloniex recorder non-200 status: ' + resp.statusCode, {feed: 'errors'})
        return retry()
      }
      //console.error('result', result.length)
      var trades = result.map(function (trade) {
        var ts = new Date(trade.date + ' GMT').getTime()
        assert(!Number.isNaN(ts))
        var ts_s = n(ts).divide(1000).value()
        //console.error('ts_s', ts_s)
        rs.recorder_id = rs.recorder_id ? Math.max(rs.recorder_id, ts_s) : ts_s
        assert(!Number.isNaN(rs.recorder_id))
        var obj = {
          id: x.name + '-' + String(trade.globalTradeID),
          trade_id: trade.globalTradeID,
          time: ts,
          size: n(trade.amount).value(),
          price: n(trade.rate).value(),
          side: trade.type,
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