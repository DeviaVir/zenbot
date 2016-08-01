var request = require('micro-request')
  , n = require('numbro')
  , z = require('zero-fill')
  , sig = require('sig')
  , tb = require('timebucket')

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
  var first_run = true
  return function mapper () {
    var options = get('options')
    if (!options.backfill || !product_id) return
    var rs = get('run_state')
    if (first_run) {
      first_run = false
      rs.gdax_backfiller_id = null
      get('db').collection('thoughts').find({
        app_name: get('app_name'),
        key: 'trade',
        'value.exchange': x.name
      }).limit(1).sort({time: -1}).toArray(function (err, results) {
        if (err) throw err
        if (results.length) {
          rs.gdax_max_id = results[0].value.trade_id
        }
        backfill_status(x, retry)
      })
      return
    }
    function retry () {
      setImmediate(mapper)
    }
    var uri = x.rest_url + '/products/' + product_id + '/trades?limit=' + x.backfill_limit + (rs.gdax_backfiller_id ? '&after=' + rs.gdax_backfiller_id : '')
    function withResult (result) {
      var filter_on = true
      var trades = result.filter(function (trade) {
        rs.gdax_min_backfiller_id = rs.gdax_min_backfiller_id ? Math.min(rs.gdax_min_backfiller_id, trade.trade_id) : trade.trade_id
        if (trade.trade_id === rs.gdax_max_id) {
          get('logger').info('gdax backfiller', 'caught up.'.cyan, 'continuing backfill after'.grey, rs.gdax_min_backfiller_id)
          rs.gdax_backfiller_id = rs.gdax_min_backfiller_id
          filter_on = false
        }
        return filter_on
      }).map(function (trade) {
        rs.gdax_backfiller_id = rs.gdax_backfiller_id ? Math.min(rs.gdax_backfiller_id, trade.trade_id) : trade.trade_id
        var obj = {
          id: x.name + '-' + String(trade.trade_id),
          trade_id: trade.trade_id,
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
    }
    //get('logger').info(z(c.max_slug_length, 'GET', ' '), uri.grey)
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
      withResult(result)
    })
  }
}