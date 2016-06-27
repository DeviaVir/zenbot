var numeral = require('numeral')

module.exports = function container (get, set) {
  return function mountRecorder (cb) {
    var socket = get('utils.gdaxWebsocket')
    var counter = 0
    setInterval(function () {
      var totalSize = trades.reduce(function (prev, curr) {
        return prev + curr.size
      }, 0)
      var totalPrice = trades.reduce(function (prev, curr) {
        return prev + curr.price
      }, 0)
      var avg = trades.length ? numeral(totalPrice / trades.length).format('$0,0') : 0
      get('console').log('saved ' + counter + ' messages. trades: ' + trades.length + ' ' + avg + ' / ' + numeral(totalSize).format('0.000'))
      trades = []
      counter = 0
    }, 10000)
    var trades = []
    socket.on('message', function (message) {
      message.id = String(message.sequence)
      message.time_date = new Date(message.time)
      get('db.messages').save(message, function (err, saved) {
        if (err) get('console').error('message save err', err)
        counter++
        if (saved.type === 'match' && saved.product_id === 'BTC-USD') {
          trades.push({
            size: parseFloat(saved.size),
            price: parseFloat(saved.price)
          })
        }
      })
    })
    get('console').log('mounted GDAX recorder.')
    cb()
  }
}