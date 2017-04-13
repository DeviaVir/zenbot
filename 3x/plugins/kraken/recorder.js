
// https://www.kraken.com/help/api
// https://api.kraken.com/0/public/Trades?pair=XBTUSD
/*
id: 'gdax-8809631',
  trade_id: 8809631,
  time: 1464316978837,
  asset: 'BTC',
  currency: 'USD',
  size: 0.01470572,
  price: 467.45,
  side: 'sell',
  exchange: 'gdax' }
*/
var request = require('micro-request')
  , n = require('numbro')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var x = get('exchanges.kraken')
  var log_trades = get('utils.log_trades')
  var get_products = get('utils.get_products')
  var map = get('map')
  var trade_id_multiplier = 1000000000
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
      if (!s.recorder_id) {
        s.recorder_id = n(tb('1h')
          .subtract(1)
          .toMilliseconds()).divide(1000).multiply(trade_id_multiplier).value()
      }
      function retry () {
        setTimeout(getNext, c.record_timeout)
      }
      function getNext () {
        function withResult (result) {
          // <price>, <volume>, <time>, <buy/sell>, <market/limit>, <miscellaneous>
          var PRICE  = 0
          var VOLUME = 1
          var TIME   = 2
          var SIDE   = 3

          var trades = result.map(function (trade) {
            // conversions
            trade[SIDE] = (trade[SIDE] === 'b') ? 'buy' : 'sell'
            var trade_id = n(trade[TIME]).multiply(trade_id_multiplier).value()
            //s.recorder_id = s.recorder_id ? Math.max(s.recorder_id, trade_id) : trade_id
            trade[TIME] = Math.floor(trade[TIME] * 1000)
            var obj = {
              id: x.name + '-' + String(trade_id),
              trade_id: trade_id,
              time: new Date(trade[TIME]).getTime(),
              asset: product.asset,
              currency: product.currency,
              size: n(trade[VOLUME]).value(),
              price: n(trade[PRICE]).value(),
              side: trade[SIDE],
              exchange: x.name
            }

            //get('logger').info('trade',JSON.stringify(obj))
            map('trade', obj)
            return obj
          })
          log_trades(x.name, trades)
          retry()
        }
        var uri = x.rest_url + '/public/Trades?pair=' + product.id + '&since=' + s.recorder_id
        //get('logger').info('URL', uri)
        request(uri, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
          if (err) {
            get('logger').error(x.name + ' recorder err', err, {feed: 'errors'})
            return retry()
          }
          if (resp.statusCode !== 200) {
            console.error(result)
            get('logger').error(x.name + ' non-200 status: ' + resp.statusCode, {feed: 'errors'})
            return retry()
          }
          if (result && result.result && Object.keys(result.result).length) {
            var resp_key = Object.keys(result.result)[0]
            var trades = result.result[resp_key]
            // NOTE: the array of trades is something like result.result.XXBTZUSD
            s.recorder_id = n(result.result.last).value()
            withResult(result.result[resp_key])
          }
          else if (result && result.error && result.error.length) {
            get('logger').error(x.name + ' err: ' + result.error[0], {feed: 'errors'})
            setTimeout(retry, 10000)
          }
          else {
            setTimeout(retry, 10000)
          }
        })
      }
      getNext()
    })
  }
}
