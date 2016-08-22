
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
  var is_backfilled = get('utils.is_backfilled')
  var map = get('map')
  var trade_id_multiplier = 1000000000
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
      if (!s.backfiller_id) {
        s.backfiller_id = n(tb('1d')
          .subtract(c.backfill_days)
          .toMilliseconds()).divide(1000).multiply(trade_id_multiplier).value()
        s.backfiller_target = n(new Date().getTime()).multiply(trade_id_multiplier).value()
      }
      //s.backfiller_id = null // start from scratch
      function retry () {
        setTimeout(getNext, x.backfill_timeout)
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
            //s.backfiller_id = s.backfiller_id ? Math.max(s.backfiller_id, trade_id) : trade_id
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
          if (s.backfiller_id >= s.backfiller_target) {
            get('logger').info(x.name, (product.asset + '/' + product.currency + ' backfill complete').grey)
          }
          else {
            retry()
          }
        }
        var uri = x.rest_url + '/public/Trades?pair=' + product.id + '&since=' + n(s.backfiller_id).format('0')
        //get('logger').info('URL', uri)
        request(uri, {headers: {'User-Agent': USER_AGENT}}, function (err, resp, result) {
          if (err) {
            get('logger').error(x.name + ' backfiller err', err, {feed: 'errors'})
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
            s.backfiller_id = n(result.result.last).value()
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
