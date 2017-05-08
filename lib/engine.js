var path = require('path')
  , tb = require('timebucket')
  , moment = require('moment')
  , z = require('zero-fill')
  , n = require('numbro')
  , colors = require('colors')
  , fs = require('fs')
  , series = require('run-series')
  , minimist = require('minimist')

module.exports = function container (get, set, clear) {
  return function (s) {
    var so = s.options
    s.selector = get('lib.normalize-selector')(so.selector)
    var selector_parts = s.selector.split('.')
    s.exchange = get('exchanges.' + selector_parts[0])
    s.product_id = selector_parts[1]
    s.asset = s.product_id.split('-')[0]
    s.currency = s.product_id.split('-')[1]
    s.strategy = get('strategies.' + so.strategy)
    s.lookback = []
    s.day_count = 0
    if (so.mode === 'sim') {
      s.balance = {asset: so.asset_capital, currency: so.currency_capital}
    }
    else {
      s.balance = {asset: 0, currency: 0}
    }
    s.my_trades = []
    var ctx = {
      option: function (name, desc, type, def) {
        if (typeof so[name] === 'undefined') {
          so[name] = def
        }
      }
    }
    if (s.strategy.getOptions) {
      s.strategy.getOptions.call(ctx)
    }
    if (so.start) {
      s.start_report_time = tb(so.start).resize(so.period).subtract(1).toMilliseconds()
    }

    function fa (amt) {
      return n(amt).format('0.000000') + ' ' + s.asset
    }

    function fc (amt) {
      if (s.currency === 'BTC') return n(amt).format('0.000000') + ' BTC'
      return n(amt).format('0.00') + ' ' + s.currency
    }

    function pct (ratio) {
      return n(ratio).format('0.00%')
    }

    function initBuffer (trade) {
      var d = tb(trade.time).resize(so.period)
      s.period = {
        id: d.toString(),
        time: d.toMilliseconds(),
        open: trade.price,
        high: trade.price,
        low: trade.price,
        close: trade.price,
        volume: 0,
        close_time: null
      }
    }

    function onTrade (trade) {
      s.period.high = Math.max(trade.price, s.period.high)
      s.period.low = Math.min(trade.price, s.period.low)
      s.period.close = trade.price
      s.period.volume += trade.size
      s.period.close_time = trade.time
    }

    function executeStop (do_sell_stop) {
      var stop_signal
      if (s.my_trades.length) {
        var last_trade = s.my_trades[s.my_trades.length - 1]
        s.last_trade_worth = last_trade.type === 'buy' ? (s.period.close - last_trade.price) / last_trade.price : (last_trade.price - s.period.close) / last_trade.price
        if (!s.acted_on_stop) {
          if (last_trade.type === 'buy') {
            if (do_sell_stop && s.sell_stop && s.period.close < s.sell_stop) {
              stop_signal = 'sell'
              console.log('sell stop triggered at ' + pct(s.last_trade_worth) + ' trade worth')
            }
            else if (so.profit_stop_enable_pct && s.last_trade_worth >= (so.profit_stop_enable_pct / 100)) {
              s.profit_stop_high = Math.max(s.profit_stop_high || s.period.close, s.period.close)
              s.profit_stop = s.profit_stop_high - (s.profit_stop_high * (so.profit_stop_pct / 100))
            }
            if (s.profit_stop && s.period.close < s.profit_stop && s.last_trade_worth > 0) {
              stop_signal = 'sell'
              console.log('profit stop triggered at ' + pct(s.last_trade_worth) + ' trade worth')
            }
          }
          else {
            if (s.buy_stop && s.period.close > s.buy_stop) {
              stop_signal = 'buy'
              console.log('buy stop triggered at ' + pct(s.last_trade_worth) + ' trade worth')
            }
          }
        }
      }
      if (stop_signal) {
        s.signal = stop_signal
        s.acted_on_stop = true
        executeSignal()
      }
    }

    function executeSignal () {
      var size, price
      if (s.signal === 'buy') {
        size = (s.balance.currency * so.buy_pct / 100) / s.period.close
        if (size >= 0.01)  {
          price = s.period.close - (s.period.close * (so.markup_pct / 100))
          s.buy_order = {
            size: size,
            price: price,
            type: 'limit',
            time: s.period.close_time,
            orig_time: s.period.close_time
          }
        }
        delete s.sell_order
        s.acted_on_trend = true
      }
      else if (s.signal === 'sell') {
        size = s.balance.asset * so.sell_pct / 100
        if (size >= 0.01)  {
          price = s.period.close + (s.period.close * (so.markup_pct / 100))
          var sell_loss = s.last_buy_price ? (price - s.last_buy_price) / s.last_buy_price * -100 : null
          if (so.max_sell_loss_pct && sell_loss > so.max_sell_loss_pct) {
            console.error('refusing to sell at', fc(price), 'sell loss of', pct(sell_loss / 100))
          }
          else {
            s.sell_order = {
              size: size,
              price: price,
              type: 'limit',
              time: s.period.close_time,
              orig_time: s.period.close_time
            }
          }
        }
        delete s.buy_order
        s.acted_on_trend = true
      }
    }

    // @todo: market orders don't apply slippage, or adjust size to prevent overdraw.
    function executeOrder (trade) {
      var price, fee = 0
      if (s.buy_order) {
        if (s.buy_order.type === 'market' || trade.price <= s.buy_order.price) {
          price = trade.price
          s.balance.asset += s.buy_order.size
          s.balance.currency -= price * s.buy_order.size
          if (s.buy_order.type === 'market') {
            fee = (price * s.buy_order.size) * (so.fee_pct / 100)
            s.balance.currency -= fee
          }
          s.action = 'bought'
          s.my_trades.push({
            time: trade.time,
            execution_time: trade.time - s.buy_order.orig_time,
            type: 'buy',
            market: s.buy_order.type === 'market',
            size: s.buy_order.size,
            price: price,
            fee: fee
          })
          s.last_buy_price = price
          delete s.buy_order
          delete s.buy_stop
          delete s.sell_stop
          if (!s.acted_on_stop && so.sell_stop_pct) {
            s.sell_stop = price - (price * (so.sell_stop_pct / 100))
          }
          delete s.profit_stop
          delete s.profit_stop_high
        }
      }
      else if (s.sell_order) {
        if (s.sell_order.type === 'market' || trade.price >= s.sell_order.price) {
          price = trade.price
          s.balance.asset -= s.sell_order.size
          s.balance.currency += price * s.sell_order.size
          if (s.sell_order.type === 'market') {
            fee = (price * s.sell_order.size) * (so.fee_pct / 100)
            s.balance.currency -= fee
          }
          s.action = 'sold'
          s.signal = null
          s.my_trades.push({
            time: trade.time,
            execution_time: trade.time - s.sell_order.orig_time,
            type: 'sell',
            market: s.sell_order.type === 'market',
            size: s.sell_order.size,
            price: price,
            fee: fee
          })
          delete s.sell_order
          delete s.buy_stop
          if (!s.acted_on_stop && so.buy_stop_pct) {
            s.buy_stop = price + (price * (so.buy_stop_pct / 100))
          }
          delete s.sell_stop
          delete s.profit_stop
          delete s.profit_stop_high
        }
      }
    }

    function adjustBid (trade) {
      var price, size
      if (so.order_adjust_time) {
        if (s.buy_order && trade.time - s.buy_order.time >= so.order_adjust_time) {
          price = trade.price - (trade.price * (so.markup_pct / 100))
          size = (s.balance.currency * so.buy_pct / 100) / price
          s.buy_order = {
            size: size,
            price: price,
            type: 'limit',
            time: trade.time
          }
        }
        else if (s.sell_order && trade.time - s.sell_order.time >= so.order_adjust_time) {
          price = trade.price + (trade.price * (so.markup_pct / 100))
          var sell_loss = s.last_buy_price ? (price - s.last_buy_price) / s.last_buy_price * -100 : null
          if (so.max_sell_loss_pct && sell_loss > so.max_sell_loss_pct) {
            console.error('refusing to sell at', fc(price), 'sell loss of', pct(sell_loss / 100))
            delete s.sell_order
          }
          else {
            size = s.balance.asset * so.sell_pct / 100
            s.sell_order = {
              size: size,
              price: price,
              type: 'limit',
              time: trade.time
            }
          }
        }
      }
    }

    function writeReport () {
      process.stdout.write(moment(s.period.time).format('YYYY-MM-DD HH').grey)
      process.stdout.write(z(16, fc(s.period.close), ' ').white)
      if (s.lookback[0]) {
        var diff = (s.period.close - s.lookback[0].close) / s.lookback[0].close
        process.stdout.write(z(16, (diff >= 0 ? '+' : '') + pct(diff), ' ')[diff >= 0 ? 'green' : 'red'])
      }
      else {
        process.stdout.write(z(16, '', ' '))
      }
      var half = 5
      var bar = ''
      var stars = 0
      if (s.period.rsi >= 50) {
        bar += ' '.repeat(half)
        stars = Math.round(((s.period.rsi - 50) / 50) * (half + 1))
        bar += '+'.repeat(stars).green.bgGreen
        bar += ' '.repeat(half - stars)
      }
      else {
        stars = Math.round(((50 - s.period.rsi) / 50) * (half + 1))
        bar += ' '.repeat(half - stars)
        bar += '-'.repeat(stars).red.bgRed
        bar += ' '.repeat(half)
      }
      process.stdout.write(' ' + bar)
      if (s.strategy.onReport) {
        var cols = s.strategy.onReport.call(ctx, s)
        cols.forEach(function (col) {
          process.stdout.write(col)
        })
      }
      process.stdout.write(z(6, s.signal || 'null', ' ')[s.signal ? s.signal === 'buy' ? 'green' : 'red' : 'grey'])
      if (s.buy_order) {
        process.stdout.write(z(8, 'buying', ' ').green)
      }
      else if (s.sell_order) {
        process.stdout.write(z(8, 'selling', ' ').red)
      }
      else {
        process.stdout.write(z(8, '', ' '))
      }
      if (s.action) {
        process.stdout.write(z(9, s.action, ' ')[s.action === 'bought' ? 'green' : 'red'])
      }
      else if (s.last_trade_worth && !s.buy_order && !s.sell_order) {
        process.stdout.write(z(8, pct(s.last_trade_worth), ' ')[s.last_trade_worth > 0 ? 'green' : 'red'])
      }
      else {
        process.stdout.write(z(9, '', ' '))
      }
      process.stdout.write(z(20, fa(s.balance.asset), ' ').white)
      process.stdout.write(z(16, fc(s.balance.currency), ' ').yellow)
      var consolidated = s.balance.currency + (s.period.close * s.balance.asset)
      var profit = (consolidated - s.start_capital) / s.start_capital
      process.stdout.write(z(9, pct(profit), ' ')[profit >= 0 ? 'green' : 'red'])
      process.stdout.write('\n')
    }

    return {
      update: function (trades, cb) {
        trades.sort(function (a, b) {
          if (a.time < b.time) return -1
          if (a.time > b.time) return 1
          return 0
        })
        var tasks = trades.map(function (trade) {
          return function (done) {
            var period_id = tb(trade.time).resize(so.period).toString()
            var day = tb(trade.time).resize('1d')
            if (s.last_day && s.last_day.toString() && day.toString() !== s.last_day.toString()) {
              s.day_count += day.value - s.last_day.value
            }
            s.last_day = day
            if (!s.period) {
              initBuffer(trade)
            }
            if (period_id !== s.period.id) {
              get('lib.rsi')(s, 'rsi', so.rsi_periods)
              s.strategy.onPeriod.call(ctx, s, function () {
                s.acted_on_stop = false
                if (!so.start || trade.time >= so.start) {
                  executeStop(true)
                  executeSignal()
                }
                if (!so.start || trade.time >= s.start_report_time) {
                  writeReport()
                }
                s.lookback.unshift(s.period)
                s.action = null
                initBuffer(trade)
                withOnPeriod()
              })
            }
            else {
              withOnPeriod()
            }
            function withOnPeriod () {
              onTrade(trade)
              if (!so.start || trade.time >= so.start) {
                if (!s.start_capital) {
                  s.start_capital = 0
                  if (so.asset_capital) {
                    s.start_capital += so.asset_capital * trade.price
                  }
                  if (so.currency_capital) {
                    s.start_capital += so.currency_capital
                  }
                }
                executeStop()
                adjustBid(trade)
                executeOrder(trade)
              }
              s.last_period_id = period_id
              setImmediate(done)
            }
          }
        })
        series(tasks, cb)
      },

      exit: function (cb) {
        cb()
      }
    }
  }
}