/*
https://poloniex.com/support/api/
https://poloniex.com/public?command=returnTradeHistory&currencyPair=BTC_NXT&start=1410158341&end=1410499372
https://poloniex.com/public?command=returnTradeHistory&currencyPair=USDT_BTC
*/

var request = require('micro-request')
  , n = require('numbro')
  , z = require('zero-fill')
  , sig = require('sig')
  , tb = require('timebucket')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.poloniex')
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
  var first_run = true
  return function mapper () {
    var options = get('options')
    if (!options.backfill || !product_id) return
    var rs = get('run_state')
    rs.poloniex || (rs.poloniex = {})
    rs = rs.poloniex
    if (first_run) {
      first_run = false
      rs.backfiller_id = null
      get('db').collection('thoughts').find({
        app_name: get('app_name'),
        key: 'trade',
        'value.exchange': x.name
      }).limit(1).sort({time: -1}).toArray(function (err, results) {
        if (err) throw err
        if (results.length) {
          rs.max_id = results[0].value.time
        }
        backfill_status(x, retry)
      })
      return
    }
    function retry () {
      setImmediate(mapper)
    }
    var uri = x.rest_url
    var query = {
      command: 'returnTradeHistory',
      currencyPair: product_id,
      start: Math.round(tb().resize('1h').subtract(2).toMilliseconds() / 1000)
    }
    if (rs.backfiller_id) {
      query.end = rs.backfiller_id
      query.start = Math.round(tb('s', rs.backfiller_id).resize('1h').subtract(2).toMilliseconds() / 1000)
    }
    function withResult (result) {
      var filter_on = true
      var trades = result.filter(function (trade) {
        rs.min_backfiller_id = rs.min_backfiller_id ? Math.min(rs.min_backfiller_id, trade.globalTradeID) : trade.globalTradeID
        if (trade.globalTradeID === rs.max_id) {
          //get('logger').info('poloniex backfiller', 'caught up.'.cyan, 'continuing backfill after'.grey, rs.min_backfiller_id)
          rs.backfiller_id = rs.min_backfiller_id
          filter_on = false
        }
        return filter_on
      }).map(function (trade) {
        var ts = new Date(trade.date + ' GMT').getTime()
        var ts_s = n(ts).divide(1000).value()
        assert(!Number.isNaN(ts))
        rs.backfiller_id = rs.backfiller_id ? Math.min(rs.backfiller_id, ts_s) : ts_s
        assert(!Number.isNaN(rs.backfiller_id))
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
      //log_trades(x.name + ' backfiller', trades)
      backfill_status(x, retry)
    }
    //get('logger').info(z(c.max_slug_length, 'GET', ' '), uri.grey, query, {feed: 'backfiller'})
    request(uri, {query: query, headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
      if (err) {
        console.error('error', err)
        get('logger').error('poloniex backfiller err', err, {feed: 'errors'})
        return retry()
      }
      if (resp.statusCode !== 200 || toString.call(result) !== '[object Array]') {
        console.error(result)
        get('logger').error('poloniex backfiller non-200 status: ' + resp.statusCode, {feed: 'errors'})
        return retry()
      }
      withResult(result)
    })
  }
}