var n = require('numeral')
  , colors = require('colors')
  , tb = require('timebucket')
  , zerofill = require('zero-fill')
  , constants = require('../conf/constants.json')

module.exports = function container (get, set, clear) {
  var client = get('utils.client')
  var bot = get('bot')
  var counter = 0
  function getNext () {
    client.getProductTrades({after: bot.after}, function (err, resp, trades) {
      if (err) {
        get('console').error('getProductTrades err', err)
        return setTimeout(getNext, 5000)
      }
      if (!trades.length) {
        get('console').info('done!')
        process.exit()
      }
      var trades = trades.map(function (trade) {
        return {
          id: String(trade.trade_id),
          time: new Date(trade.time).getTime(),
          size: n(trade.size).value(),
          price: n(trade.price).value(),
          side: trade.side
        }
      }).reverse()
      bot.after = trades[0].id
      var ticks = {}
      trades.forEach(function (trade) {
        var tickId = tb(trade.time)
          .resize(constants.tick_size)
          .toString()
        ticks[tickId] || (ticks[tickId] = [])
        ticks[tickId].push(trade)
        counter++
      })
      Object.keys(ticks).forEach(function (tickId) {
        var tick = get('db.ticks').create(ticks[tickId])
        if (tick && tick.ticker) get('console').info('backfilled', tb(tickId).toDate(), tick.ticker)
      })
      get('console').info('processed', counter, 'trades. after = ' + bot.after)
      setTimeout(getNext, 0)
    })
  }
  setTimeout(getNext, 1000)
  return null
}