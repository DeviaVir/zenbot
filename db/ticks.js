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
      obj.saved = true
      cb(null, obj);
    },
    save: function (tick, opts, cb) {
      var is_new = !tick.saved
      // respond before the obj is saved
      tick.timestamp = get_timestamp(tick.time)
      tick.ticker = n(tick.side_vol).divide(tick.vol).format('0%') + (tick.side === 'BUY' ? ' BULL' : ' BEAR')
      if (tick.buy_vol >= 20) {
        tick.ansi_ticker = tick.ticker.green
      }
      else if (tick.side_vol >= 20 && tick.side === 'SELL') {
        tick.ansi_ticker = tick.ticker.red
      }
      else {
        tick.ansi_ticker = tick.ticker.grey
      }
      if (tick.ansi_ticker) {
        tick.exchanges_ticker = Object.keys(tick.exchanges).map(function (name) {
          var x = tick.exchanges[name]
          return name + ' = ' + n(x.vol).format('0.000') + ' ' + n(x.side_vol).divide(x.vol).format('0%') + ' ' + x.side
        }).join(', ').white
      }
      if (is_new) {
        //get('zenbot:console').info(get_timestamp(tick.time).white, tick.ansi_ticker, tick.trades, 'trades', tick.exchanges_ticker, {data: {tick: tick}})
      }
      else {
        //get('zenbot:console').info(get_timestamp(tick.time).white, 'UPDATED', tick.ansi_ticker, tick.trades, 'trades', tick.exchanges_ticker, {data: {tick: tick}})
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
    }
  })
}