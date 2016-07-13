var n = require('numbro')
  , colors = require('colors')
  , tb = require('timebucket')
  , c = require('../conf/constants.json')
  , zerofill = require('zero-fill')
  , assert = require('assert')

module.exports = function container (get, set) {
  var get_timestamp = get('zenbot:utils.get_timestamp')
  return get('db.createCollection')('ticks', {
    load: function (obj, opts, cb) {
      // respond after the obj is loaded
      cb(null, obj);
    },
    save: function (tick, opts, cb) {
      // respond before the obj is saved
      tick.ticker = n(tick.side_vol).divide(tick.vol).format('0%') + (tick.side === 'BUY' ? ' BULL' : ' BEAR')
      if (tick.buy_vol >= 20) {
        tick.ansi_ticker = tick.ticker.green
      }
      else if (tick.side_vol >= 20 && tick.side === 'SELL') {
        tick.ansi_ticker = tick.ticker.red
      }
      if (tick.ansi_ticker) {
        tick.exchanges_ticker = Object.keys(tick.exchanges).map(function (name) {
          var x = tick.exchanges[name]
          return name + ' = ' + n(x.vol).format('0.000') + ' ' + n(x.side_vol).divide(x.vol).format('0%') + ' buy'
        }).join(', ')
        get('zenbot:console').info(get_timestamp(tick.time), tick.ansi_ticker, tick.exchanges_ticker, {data: {tick: tick}})
      }
      cb(null, tick);
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
      create: function (tick, trades, done) {
        trades = trades.filter(function (trade) {
          return trade.asset === c.asset
        })
        if (!trades.length) return done(null, tick)
        if (!tick) {
          var bucket = tb(trades[0].time).resize(c.tick_size)
          tick = {
            id: bucket.toString(),
            time: bucket.toMilliseconds(),
            vol: 0,
            trades: 0,
            buys: 0,
            buy_vol: 0,
            exchanges: {},
            trade_ids: []
          }
          tick.timestamp = tick.end_timestamp = get_timestamp(tick.time)
        }
        trades.forEach(function (trade) {
          if (tick.trade_ids.indexOf(trade.id) !== -1) return
          assert(tb(trade.time).resize(c.tick_size).toString() === tick.id)
          tick.trade_ids.push(trade.id)
          tick.exchanges[trade.exchange] || (tick.exchanges[trade.exchange] = {
            vol: 0,
            trades: 0,
            buys: 0,
            buy_vol: 0,
            high: 0,
            low: 10000
          })
          var x = tick.exchanges[trade.exchange]
          x.vol = n(x.vol).add(trade.size).value()
          tick.vol = n(tick.vol).add(trade.size).value()
          x.trades++
          tick.trades++
          if (trade.side === 'sell') {
            x.buys++
            tick.buys++
            x.buy_vol = n(x.buy_vol).add(trade.size).value()
            tick.buy_vol = n(tick.buy_vol).add(trade.size).value()
          }
          x.buy_ratio = n(x.buy_vol)
            .divide(x.vol)
            .value()
          if (x.buy_ratio > 0.5) {
            x.side = 'BUY'
          }
          else if (x.buy_ratio < 0.5) {
            x.side = 'SELL'
          }
          else {
            x.side = 'EVEN'
          }
          var ratio = x.buy_ratio
          if (x.side === 'SELL') {
            ratio = n(1)
              .subtract(ratio)
              .value()
          }
          x.side_vol = n(x.vol)
            .multiply(ratio)
            .value()
          if (trade.asset === c.asset && trade.currency === c.currency) {
            if (!x.open) {
              x.open = trade.price
            }
            x.high = Math.max(trade.price, x.high)
            x.low = Math.min(trade.price, x.low)
            x.close = trade.price
            x.typical = n(x.high)
              .add(x.low)
              .add(x.close)
              .divide(3)
              .value()
          }
        })
        tick.buy_ratio = n(tick.buy_vol)
          .divide(tick.vol)
          .value()
        if (tick.buy_ratio > 0.5) {
          tick.side = 'BUY'
        }
        else if (tick.buy_ratio < 0.5) {
          tick.side = 'SELL'
        }
        else {
          tick.side = 'EVEN'
        }
        var ratio = tick.buy_ratio
        if (tick.side === 'SELL') {
          ratio = n(1)
            .subtract(ratio)
            .value()
        }
        tick.side_vol = n(tick.vol)
          .multiply(ratio)
          .value()
        get('db.ticks').save(tick, function (err, saved) {
          if (err) return get('console').error('tick save err', err)
          done(null, saved)
        })
      }
    }
  })
}