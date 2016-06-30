var numeral = require('numeral')
  , colors = require('colors')
  , tb = require('timebucket')

module.exports = function container (get, set) {
  return get('db.createCollection')('ticks', {
    load: function (obj, opts, cb) {
      // respond after the obj is loaded
      cb(null, obj);
    },
    save: function (obj, opts, cb) {
      // respond before the obj is saved
      cb(null, obj);
    },
    afterSave: function (obj, opts, cb) {
      // respond after the obj is saved
      cb(null, obj);
    },
    destroy: function (obj, opts, cb) {
      // respond after the obj is destroyed
      cb(null, obj)
    },
    methods: {
      create: function (trades) {
        var trade_ticker = ''
        if (trades.length) {
          var open, high = 0, low = 10000, close, buys = 0, vol = 0, buyVol = 0
          var closeTime
          trades.forEach(function (trade) {
            if (typeof open === 'undefined') open = trade.price
            high = Math.max(trade.price, high)
            low = Math.min(trade.price, low)
            close = trade.price
            closeTime = trade.time
            if (trade.side === 'sell') {
              buyVol = numeral(buyVol).add(trade.size).value()
              buys++
            }
            vol = numeral(vol).add(trade.size).value()
          })
          var typical = numeral(high).add(low).add(close).divide(3).value()
          var buyRatio = numeral(buyVol).divide(vol).value()
          var side
          if (buyRatio > 0.5) side = 'BUY'
          if (buyRatio < 0.5) side = 'SELL'
          if (buyRatio === 0.5) side = 'EVEN'
          var bucket = tb(closeTime).resize(get('conf.tick_size'))
          trade_ticker = side + ' ' + numeral(typical).format('$0,0.00') + '/' + numeral(vol).format('0.000')
          var orig_ticker = trade_ticker
          var tick = {
            id: bucket.toString(),
            time: bucket.toMilliseconds(),
            vol: vol,
            high: high,
            low: low,
            open: open,
            close: close,
            trades: trades.length,
            buys: buys,
            buyVol: buyVol,
            buyRatio: buyRatio,
            typical: typical,
            price: numeral(typical).format('$0,0.00'),
            side: side,
            ticker: orig_ticker
          }
          if (vol > 20) {
            trade_ticker = trade_ticker.red
          }
          else if (vol > 5) {
            trade_ticker = trade_ticker.yellow
          }
          else {
            trade_ticker = trade_ticker.white
          }
          tick.trade_ticker = ' trades: ' + trade_ticker
          get('db.ticks').save(tick, function (err, saved) {
            if (err) return get('console').error('tick save err', err)
          })
          return tick
        }
      }
    }
  })
}