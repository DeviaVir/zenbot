module.exports = function container (get, set, clear) {
  return function mountRecorder (options) {
    options || (options = {})
    var socket = get('utils.gdaxWebsocket')
    var counter = 0
    var lastTick = new Date().getTime()

    if (options.tweet) {
      var twitterClient = get('utils.twitterClient')
      function onTweet (err, data, response) {
        if (err) return get('console').error('tweet err', err)
        if (response.statusCode === 200 && data && data.id_str) {
          get('console').log('tweeted: '.cyan + data.text.white)
        }
        else get('console').error('tweet err', response.statusCode, data)
      }
    }

    function onTick () {
      var trade_ticker = ''
      var params = {
        query: {
          time: {
            $gt: lastTick
          }
        },
        sort: {
          time: 1
        }
      }
      lastTick = new Date().getTime()
      get('db.trades').select(params, function (err, trades) {
        if (err) return get('console').error('trade select err', err)
        var tick = get('db.ticks').create(trades)
        get('console').log('saw ' + counter + ' messages.' + (tick ? tick.trade_ticker : ''))
        if (tick && options.tweet && tick.vol > 20) {
          var tweet = {
            status: 'big trade: ' + tick.ticker + ' BTC at ' + get('utils.getTimestamp')(tick.time)
          }
          twitterClient.post('statuses/update', tweet, onTweet)
        }
        if (counter === 0) {
          get('console').log('no messages in last tick. rebooting socket...')
          reboot()
        }
        counter = 0
      })
    }
    var interval = setInterval(onTick, get('conf.tick_interval'))

    function reboot () {
      try {
        socket.disconnect()
      }
      catch (e) {}
      clear('utils.gdaxWebsocket')
      clearInterval(interval)
      mountRecorder(options)
    }

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
    socket.on('error', function (err) {
      get('console').error('socket err', err)
      get('console').log('socket error. rebooting socket in 10s...')
      setTimeout(reboot, 10000)
    })
  }
}