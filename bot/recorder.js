var n = require('numbro')
  , constants = require('../conf/constants.json')
  , tb = require('timebucket')
  , zerofill = require('zero-fill')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var get_time = get('utils.get_time')
  function mountRecorder () {
    var get_time = get('utils.get_time')
    var client = get('utils.client')
    var bitfinex_client = get('utils.bitfinex_client')
    var bot = get('bot')
    var max_trade_id = 0, max_timestamp = 0
    if (bot.tweet) {
      var twitter_client = get('utils.twitter_client')
      function onTweet (err, data, response) {
        if (err) return get('console').error('tweet err', err)
        if (response.statusCode === 200 && data && data.id_str) {
          get('console').info('tweeted: '.cyan + data.text.white, {public: true, data: {tweet: data}})
          get('console').info('tweeted: '.cyan + data.text.white, {public: false, data: {tweet: data}})
        }
        else get('console').error('tweet err', response.statusCode, data)
      }
    }
    function fetchTrades () {
      var tasks = {
        gdax: function (cb) {
          client.getProductTrades(max_trade_id ? {before: max_trade_id} : {}, function (err, resp, trades) {
            if (err) {
              return cb(err)
            }
            if (!trades || !trades.length) {
              return cb(null, [])
            }
            var orig_max_trade_id = max_trade_id
            trades = trades.map(function (trade) {
              max_trade_id = Math.max(max_trade_id, trade.trade_id)
              return {
                id: 'gdax-' + String(trade.trade_id),
                time: new Date(trade.time).getTime(),
                size: n(trade.size).value(),
                price: n(trade.price).value(),
                side: trade.side,
                exchange: 'gdax'
              }
            }).reverse()
            if (max_trade_id === orig_max_trade_id) {
              return cb(null, [])
            }
            cb(null, trades)
          })
        },
        bitfinex: function (cb) {
          bitfinex_client.trades(constants.product_id.replace('-', '') + (max_timestamp ? '?timestamp=' + (max_timestamp + 1) : ''), function (err, trades) {
            if (err) return cb(err)
            if (!trades || !trades.length) {
              return cb(null, [])
            }
            var orig_max_timestamp = max_timestamp
            trades = trades.map(function (trade) {
              max_timestamp = Math.max(max_timestamp, trade.timestamp)
              return {
                id: 'bitfinex-' + String(trade.tid),
                time: n(trade.timestamp).multiply(1000).value(),
                size: n(trade.amount).value(),
                price: n(trade.price).value(),
                side: trade.type,
                exchange: trade.exchange
              }
            }).reverse()
            if (max_timestamp === orig_max_timestamp) {
              return cb(null, [])
            }
            cb(null, trades)
          })
        }
      }
      parallel(tasks, function (err, results) {
        if (err) {
          return get('console').error('fetch trades err', err)
        }
        var trades = [].concat(results.gdax, results.bitfinex)
        processTrades(trades)
      })
    }
    function processTrades (trades) {
      var ticks = {}
      trades.forEach(function (trade) {
        var tickId = tb(trade.time)
          .resize(constants.tick_size)
          .toString()
        ticks[tickId] || (ticks[tickId] = [])
        ticks[tickId].push(trade)
      })
      Object.keys(ticks).forEach(function (tickId) {
        var tick = get('db.ticks').create(ticks[tickId])
        if (tick) {
          get('console').info(tick.trade_ticker, tick.exchanges, {data: {tick: tick}})
          var ratio = tick.buy_ratio
          if (tick.side === 'SELL') {
            ratio = n(1)
              .subtract(ratio)
              .value()
          }
          var vol = n(tick.vol)
            .multiply(ratio)
            .value()
          if (bot.tweet && tick.vol >= 20) {
            var tweet = {
              status: [
                'big ' + tick.side + ':',
                'size: ' + n(vol).format('0.000') + ' ' + constants.asset,
                'price: ' + tick.price,
                'time: ' + get_time(tick.time),
                constants.base_url + '/#t__' + (new Date().getTime() + 30000) + ' ' + constants.hashtags
              ].join('\n')
            }
            twitter_client.post('statuses/update', tweet, onTweet)
          }
        }
      })
      get('console').info('saw ' + trades.length + ' trades.')
    }
    fetchTrades()
    var interval = setInterval(fetchTrades, constants.tick_ms)
  }
  mountRecorder()
  return null
}