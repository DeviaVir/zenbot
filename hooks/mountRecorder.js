var numeral = require('numeral')
  , colors = require('colors')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var runningVol = 0, runningTvol = 0
  return function mountRecorder (cb) {
    var socket = get('utils.gdaxWebsocket')
    var counter = 0
    function onTick () {
      var trade_ticker = ''
      var params = {
        query: {
          time: {
            $gt: new Date().getTime() - get('conf.tick_interval')
          }
        },
        sort: {
          time: 1
        }
      }
      get('db.trades').select(params, function (err, trades) {
        if (err) return get('console').error('trade select err', err)
        if (trades.length) {
          var high = 0, low = 10000, close, buys = 0, vol = 0, buyVol = 0
          trades.forEach(function (trade) {
            high = Math.max(trade.price, high)
            low = Math.min(trade.price, low)
            close = trade.price
            if (trade.side === 'sell') {
              buyVol += trade.size
              buys++
            }
            vol += trade.size
          })
          var typical = (high + low + close) / 3
          var tvol = typical * vol
          runningVol += vol
          runningTvol += tvol
          var vwap = runningTvol / runningVol
          var buyRatio = buyVol / vol
          var side
          if (buyRatio > 0.5) side = 'BUY'
          if (buyRatio < 0.5) side = 'SELL'
          if (buyRatio === 0.5) side = 'EVEN'
          var avg = numeral(vwap).format('$0,0')
          trade_ticker = side + ' ' + avg + '/' + numeral(vol).format('0.000')
          var orig_ticker = trade_ticker
          if (vol > 20) {
            trade_ticker = trade_ticker.red
          }
          else if (vol > 5) {
            trade_ticker = trade_ticker.yellow
          }
          else {
            trade_ticker = trade_ticker.white
          }
          trade_ticker = ' trades: ' + trade_ticker
          var tick = {
            id: tb(get('conf.tick_size')).toString(),
            time: new Date().getTime(),
            date: new Date(),
            vol: vol,
            high: high,
            low: low,
            close: close,
            trades: trades.length,
            buys: buys,
            buyVol: buyVol,
            vwap: vwap,
            buyRatio: buyRatio,
            typical: typical,
            side: side,
            avg: avg,
            ticker: orig_ticker
          }
          get('db.ticks').save(tick, function (err, saved) {
            if (err) return get('console').error('tick save err', err)
          })
        }
        else {
          get('db.ticks').save({id: tb(get('conf.tick_size')).toString(), vol: 0, time: new Date().getTime(), date: new Date()}, function (err, saved) {
            if (err) return get('console').error('tick save err', err)
          })
        }
        get('console').log('saw ' + counter + ' messages.' + trade_ticker)
        if (counter === 0) {
          get('console').log('no messages in last tick. rebooting socket...')
          socket.disconnect()
          clear('utils.gdaxWebsocket')
          clearInterval(interval)
          mountRecorder()
        }
        counter = 0
      })
    }
    var interval = setInterval(onTick, get('conf.tick_interval'))
    var trades = []
    socket.on('message', function (message) {
      counter++
      if (message.type === 'match' && message.product_id === get('conf.product_id')) {
        var trade = {
          id: String(message.sequence),
          time: new Date(message.time).getTime(),
          size: parseFloat(message.size),
          price: parseFloat(message.price),
          side: message.side
        }
        get('db.trades').save(trade, function (err, saved) {
          if (err) return get('console').error('trade save err', err)
        })
      }
    })
    socket.on('open', function () {
      get('console').log('socket opened.')
    })
    socket.on('close', function () {
      get('console').log('socket closed.')
    })
    get('console').log('mounted GDAX recorder.')
    cb && cb()
  }
}