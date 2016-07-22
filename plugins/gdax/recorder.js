var request = require('micro-request')
  , n = require('numbro')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.gdax')
  var c = get('constants')
  var config = get('config')
  var log_trades = get('utils.log_trades')
  var product_id
  x.products.forEach(function (product) {
    if (product.asset === config.asset && product.currency === config.currency) {
      product_id = product.id
    }
  })
  return function recorder (options) {
    if (!product_id) return
    function retry (ms) {
      var timeout = setTimeout(recorder, c.record_interval)
      set('timeouts[]', timeout)
    }
    var rs = get('run_state')
    var uri = x.rest_url + '/products/' + product_id + '/trades' + (rs.gdax_recorder_id ? '?before=' + rs.gdax_recorder_id : '')
    //get('logger').info('GET', uri)
    request(uri, {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
      if (err) {
        get('logger').error('gdax recorder err', err, {public: false})
        return retry()
      }
      if (resp.statusCode !== 200 || toString.call(trades) !== '[object Array]') {
        console.error(trades)
        get('logger').error('gdax non-200 status: ' + resp.statusCode, {public: false})
        return retry()
      }
      trades = trades.map(function (trade) {
        rs.gdax_recorder_id = rs.gdax_recorder_id ? Math.max(rs.gdax_recorder_id, trade.trade_id) : trade.trade_id
        return {
          id: 'gdax-' + String(trade.trade_id),
          time: new Date(trade.time).getTime(),
          size: n(trade.size).value(),
          price: n(trade.price).value(),
          side: trade.side,
          exchange: x.name
        }
      })
      var tasks = trades.map(function (trade) {
        return function (cb) {
          get('motley:db.trades').save(trade, cb)
        }
      })
      parallel(tasks, function (err, trades) {
        if (err) {
          get('logger').error('gdax trade save err', err, {public: false})
        }
        log_trades(x.name + ' recorder', trades)
        return retry()
      })
    })
  }
}