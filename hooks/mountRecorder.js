var numeral = require('numeral')

module.exports = function container (get, set, clear) {
  return function mountRecorder (cb) {
    var socket = get('utils.gdaxWebsocket')
    var counter = 0
    function onTick () {
      var trade_ticker = ''
      if (trades.length) {
        var totalSize = trades.reduce(function (prev, curr) {
          return prev + curr.size
        }, 0)
        var totalPrice = trades.reduce(function (prev, curr) {
          return prev + curr.price
        }, 0)
        var numBuy = trades.reduce(function (prev, curr) {
          return prev + curr.side === 'buy' ? 1 : 0
        }, 0)
        var buyRatio = numBuy / trades.length
        var side
        if (buyRatio > 0.5) side = 'BUY'
        if (buyRatio < 0.5) side = 'SELL'
        if (buyRatio === 0.5) side = 'EVEN'
        var avg = trades.length ? numeral(totalPrice / trades.length).format('$0,0') : 0
        trade_ticker = trades.length ? ' trades: ' + numBuy + '/' + trades.length + ' ' + side + ' ' + avg + '/' + numeral(totalSize).format('0.000') : ''
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