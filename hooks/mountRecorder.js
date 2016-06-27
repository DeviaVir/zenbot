var numeral = require('numeral')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var runningVol = 0, runningTvol = 0
  return function mountRecorder (cb) {
    var socket = get('utils.gdaxWebsocket')
    var counter = 0
    function onTick () {
      var trade_ticker = ''
      if (trades.length) {
        var high = 0, low = 10000, close, buys = 0, vol = 0, buyVol = 0
        trades.forEach(function (trade) {
          high = Math.max(trade.price, high)
          low = Math.min(trade.price, low)
          close = trade.price
          if (trade.side === 'buy') buyVol += trade.size
          vol += trade.size
        })
        var typical = (high + low + close) / 3
        var tvol = typical * vol
        runningVol += vol
        runningTvol += tvol
        var vwap = runningTvol / runningVol
        var buyRatio = buyVol / vol
        var side
        if (buyRatio > 0.5) side = 'BUY'.green
        if (buyRatio < 0.5) side = 'SELL'.red
        if (buyRatio === 0.5) side = 'EVEN'.orange
        var avg = numeral(vwap).format('$0,0')
        trade_ticker = ' trades: ' + side + ' ' + avg + '/' + numeral(vol).format('0.000')
      }
      get('console').log('saved ' + counter + ' messages.' + trade_ticker)
      if (counter === 0) {
        get('console').log('no messages in last tick. rebooting socket...')
        socket.disconnect()
        clear('utils.gdaxWebsocket')
        clearInterval(interval)
        mountRecorder()
      }
      trades = []
      counter = 0
    }
    var interval = setInterval(onTick, 10000)
    var trades = []
    socket.on('message', function (message) {
      message.id = String(message.sequence)
      message.time_date = new Date(message.time)
      get('db.messages').save(message, function (err, saved) {
        if (err) return get('console').error('message save err', err)
        counter++
        if (saved.type === 'match' && saved.product_id === 'BTC-USD') {
          trades.push({
            size: parseFloat(saved.size),
            price: parseFloat(saved.price),
            side: saved.side
          })
        }
      })
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