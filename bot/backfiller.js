var numeral = require('numeral')
  , colors = require('colors')
  , tb = require('timebucket')
  , zerofill = require('zero-fill')

module.exports = function container (get, set, clear) {
  return function (options) {
    options || (options = {})
    var client = get('utils.gdaxClient')
    var counter = 0
    var after = options.after || undefined
    function getNext () {
      client.getProductTrades({after: after}, function (err, resp, trades) {
        if (err) {
          get('console').error('trade fetch err', err)
          return setTimeout(getNext, 5000)
        }
        if (!trades) return get('console').error('no trades error')
        if (!trades.length) {
          get('console').log('done!')
          process.exit()
        }
        var trades = trades.map(function (trade) {
          return {
            id: String(trade.trade_id),
            time: new Date(trade.time).getTime(),
            size: parseFloat(trade.size),
            price: parseFloat(trade.price),
            side: trade.side
          }
        }).reverse()
        after = trades[0].id
        var ticks = {}
        trades.forEach(function (trade) {
          var tickId = tb(trade.time).resize(get('conf.tick_size')).toString()
          ticks[tickId] || (ticks[tickId] = [])
          ticks[tickId].push(trade)
          counter++
        })
        Object.keys(ticks).forEach(function (tickId) {
          var tick = get('db.ticks').create(ticks[tickId])
          if (tick && tick.ticker) get('console').log('backfilled', tb(tickId).toDate(), ticker)
        })
        get('console').log('processed', counter, 'trades. after = ' + after)
        setTimeout(getNext, 0)
      })
    }
    setTimeout(getNext, 1000)
  }
}