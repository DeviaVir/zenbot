var moment = require('moment')
  , numeral = require('numeral')
  , constants = require('../conf/constants.json')
  , gleak = require('../utils/gleak')

module.exports = function container (get, set, clear) {
  function mountRecorder () {
    var get_time = get('utils.get_time')
    var websocket = get('utils.websocket')
    var bot = get('bot')
    var counter = 0
    var last_tick = new Date().getTime()

    if (bot.tweet) {
      var twitter_client = get('utils.twitter_client')
      function onTweet (err, data, response) {
        if (err) return get('console').error('tweet err', err)
        if (response.statusCode === 200 && data && data.id_str) {
          get('console').info('tweeted: '.cyan + data.text.white)
        }
        else get('console').error('tweet err', response.statusCode, data)
      }
    }

    function onTick () {
      var trade_ticker = ''
      var params = {
        query: {
          time: {
            $gt: last_tick
          }
        },
        sort: {
          time: 1
        }
      }
      last_tick = new Date().getTime()
      get('db.trades').select(params, function (err, trades) {
        if (err) return get('console').error('trade select err', err)
        var tick = get('db.ticks').create(trades)
        get('console').info('saw ' + counter + ' messages.' + (tick ? tick.trade_ticker : ''))
        if (tick && bot.tweet && tick.vol > 20) {
          var tweet = {
            status: 'big trade alert:\n\naction: ' + tick.side + '\nvolume: ' + numeral(tick.vol).format('0.000') + '\nprice: ' + tick.price + '\ntime: ' + get_time(tick.time) + '\n\n #btc #gdax'
          }
          twitter_client.post('statuses/update', tweet, onTweet)
        }
        gleak.print()
        if (counter === 0) {
          get('console').info('no messages in last tick. rebooting websocket...')
          reboot()
        }
        counter = 0
      })
    }
    var interval = setInterval(onTick, constants.tick_ms)

    function reboot () {
      try {
        websocket.disconnect()
      }
      catch (e) {}
      clear('utils.websocket')
      clearInterval(interval)
      mountRecorder()
    }

    websocket.on('message', function (message) {
      counter++
      if (message.type === 'match' && message.product_id === constants.product_id) {
        var trade = {
          id: String(message.sequence),
          time: new Date(message.time).getTime(),
          size: numeral(message.size).value(),
          price: numeral(message.price).value(),
          side: message.side
        }
        get('db.trades').save(trade, function (err, saved) {
          if (err) return get('console').error('trade save err', err)
        })
      }
    })
    websocket.on('open', function () {
      get('console').info('websocket opened.')
    })
    websocket.on('close', function () {
      get('console').info('websocket closed.')
    })
    websocket.on('error', function (err) {
      get('console').error('websocket err', err)
      get('console').info('rebooting websocket in 10s...')
      setTimeout(reboot, 10000)
    })
  }
  mountRecorder()
  return null
}