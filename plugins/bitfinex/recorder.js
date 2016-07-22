var request = require('micro-request')
  , n = require('numbro')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.bitfinex')
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
    //Bitfinex does not seem to support pagination.
    var uri = x.rest_url + '/trades/' + product_id + (rs.bitfinex_recorder_timestamp ? '?timestamp=' + rs.bitfinex_recorder_timestamp : '')
    //get('logger').info('GET', uri)
    request(uri, {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, trades) {
      if (err) {
        get('logger').error('bitfinex recorder err', err, {public: false})
        return retry()
      }
      if (resp.statusCode !== 200 || toString.call(trades) !== '[object Array]') {
        console.error(trades)
        get('logger').error('bitfinex non-200 status: ' + resp.statusCode, {public: false})
        return retry()
      }
      trades = trades.map(function (trade) {
        rs.bitfinex_recorder_timestamp = rs.bitfinex_recorder_timestamp ? Math.max(rs.bitfinex_recorder_timestamp, trade.timestamp) : trade.timestamp
        return {
          id: 'bitfinex-' + String(trade.tid),
          time: n(trade.timestamp).value(),
          size: n(trade.amount).value(),
          price: n(trade.price).value(),
          side: trade.type,
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
          get('logger').error('bitfinex trade save err', err, {public: false})
        }
        log_trades(x.name + ' recorder', trades)
        return retry()
      })
    })
  }
}