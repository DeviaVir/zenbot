var numeral = require('numeral')
  , colors = require('colors')
  , tb = require('timebucket')
  , zerofill = require('zero-fill')

module.exports = function container (get, set, clear) {
  return function mountRecorder (options) {
    options || (options = {})
    var socket = get('utils.gdaxWebsocket')
    var counter = 0
    var lastTick = new Date().getTime()
    function onTick () {
      var trade_ticker = ''
      var params = {
        query: {
          time: {
            $gte: lastTick
          }
        },
        sort: {
          time: 1
        }
      }
      lastTick = new Date().getTime()
      get('db.trades').select(params, function (err, trades) {
        if (err) return get('console').error('trade select err', err)
        var ticker = get('db.ticks').create(trades)
        get('console').log('saw ' + counter + ' messages.' + ticker)
        if (counter === 0) {
          get('console').log('no messages in last tick. rebooting socket...')
          try {
            socket.disconnect()
          }
          catch (e) {}
          clear('utils.gdaxWebsocket')
          clearInterval(interval)
          mountRecorder(options)
        }
        counter = 0
      })
    }
    var interval = setInterval(onTick, get('conf.tick_interval'))
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
  }
}