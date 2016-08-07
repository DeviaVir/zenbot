var request = require('micro-request')
  , n = require('numbro')
  , z = require('zero-fill')
  , sig = require('sig')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.gdax')
  var c = get('config')
  var log_trades = get('utils.log_trades')
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
    rs.gdax || (rs.gdax = {})
    rs = rs.gdax
    if (first_run) {
      first_run = false
      if (rs.backfiller_id) {
        rs.old_backfiller_id = rs.backfiller_id
        rs.backfiller_id = null
        rs.resume_target = rs.backfiller_start
        rs.backfiller_start = null
      }
      else {
        rs.backfilled = 0
      }
    }
    function retry () {
      setImmediate(mapper)
    }
    var uri = x.rest_url + '/products/' + product_id + '/trades?limit=' + x.backfill_limit + (rs.backfiller_id ? '&after=' + rs.backfiller_id : '')
    function withResult (result) {
      var max_id, min_time
      var trades = result.map(function (trade) {
        rs.backfiller_id = rs.backfiller_id ? Math.min(rs.backfiller_id, trade.trade_id) : trade.trade_id
        if (rs.resume_target && rs.backfiller_id === rs.resume_target) {
          //rs.backfiller_id = rs.old_backfiller_id
          //rs.resume_target = null
          //get('logger').info(x.name, 'caught up. resuming after', rs.old_backfiller_id)
        }
        var obj = {
          id: x.name + '-' + String(trade.trade_id),
          trade_id: trade.trade_id,
          time: new Date(trade.time).getTime(),
          size: n(trade.size).value(),
          price: n(trade.price).value(),
          side: trade.side,
          exchange: x.name
        }
        max_id = max_id ? Math.max(obj.trade_id, max_id) : max_id
        min_time = min_time ? Math.min(obj.time, min_time) : min_time
        rs.backfilled++
        map('trade', obj)
        return obj
      })
      if (!rs.backfiller_start) {
        rs.backfiller_start = max_id
      }
      //log_trades(x.name, trades)
      if (min_time < c.backfill_stop) {
        get('logger').info(x.name, 'backfill complete with'.grey, rs.backfilled, 'trades.'.grey)
      }
      else {
        retry()
      }
    }
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
}