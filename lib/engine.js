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
    var products = s.exchange.getProducts()
    products.forEach(function (product) {
      if (product.asset === s.asset && product.currency === s.currency) {
        s.product = product
        s.product_id = product.id
      }
    })
    if (!s.product) {
      console.error('error: could not find product "' + s.product_id + '"')
    }
    if (so.mode === 'sim' || so.mode === 'paper') {
      s.balance = {asset: so.asset_capital, currency: so.currency_capital}
    }
    else {
      s.balance = {asset: 0, currency: 0}
    }

    s.ctx = {
      option: function (name, desc, type, def) {
        if (typeof so[name] === 'undefined') {
          so[name] = def
        }
      }
    }

    s.lookback = []
    s.day_count = 0
    s.my_trades = []
    s.vol_since_last_blink = 0
    if (so.strategy) {
      s.strategy = get('strategies.' + so.strategy)
      if (s.strategy.getOptions) {
        s.strategy.getOptions.call(s.ctx)
      }
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
        period_id: d.toString(),
        size: so.period,
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
      s.strategy.calculate(s)
      s.vol_since_last_blink += trade.size
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
              console.log('\nsell stop triggered at ' + pct(s.last_trade_worth) + ' trade worth\n')
            }
            else if (so.profit_stop_enable_pct && s.last_trade_worth >= (so.profit_stop_enable_pct / 100)) {
              s.profit_stop_high = Math.max(s.profit_stop_high || s.period.close, s.period.close)
              s.profit_stop = s.profit_stop_high - (s.profit_stop_high * (so.profit_stop_pct / 100))
            }
            if (s.profit_stop && s.period.close < s.profit_stop && s.last_trade_worth > 0) {
              stop_signal = 'sell'
              console.log('\nprofit stop triggered at ' + pct(s.last_trade_worth) + ' trade worth\n')
            }
          }
          else {
            if (s.buy_stop && s.period.close > s.buy_stop) {
              stop_signal = 'buy'
              console.log('\nbuy stop triggered at ' + pct(s.last_trade_worth) + ' trade worth\n')
            }
          }
        }
      }
      if (stop_signal) {
        s.signal = stop_signal
        s.acted_on_stop = true
      }
    }

    function syncBalance (cb) {
      if (so.mode !== 'live') {
        return cb()
      }
      s.exchange.getBalance(s, function (err, balance) {
        if (err) return cb(err)
        s.balance = balance
        if (!s.start_capital) {
          s.exchange.getQuote({product_id: s.product_id}, function (err, quote) {
            if (err) return cb(err)
            s.start_price = n(quote.ask).value()
            s.start_capital = n(s.balance.currency).add(n(s.balance.asset).multiply(quote.ask)).value()
            cb()
          })
        }
        else cb()
      })
    }

    function placeOrder (type, opts, cb) {
      delete s[(type === 'buy' ? 'sell' : 'buy') + '_order']
      if (!s[type + '_order']) {
        s[type + '_order'] = {
          price: opts.price,
          size: opts.size,
          orig_price: opts.price
        }
      }
      var order = s[type + '_order']
      order.price = opts.price
      order.size = opts.size
      if (so.mode !== 'live') {
        if (!order.orig_time) order.orig_time = s.period.close_time
        order.time = s.period.close_time
        return cb(null, order)
      }
      else {
        order.product_id = s.product_id
        order.post_only = true
        s.exchange[type](order, function (err, api_order) {
          if (err) return cb(err)
          if (api_order.status === 'rejected') {
            if (api_order.reject_reason === 'post only') {
              // trigger immediate price adjustment and re-order
              return cb(null, null)
            }
            var err = new Error('order rejected')
            err.order = api_order
            return cb(err)
          }
          order.order_id = api_order.id
          if (!order.time) {
            order.orig_time = new Date(api_order.created_at).getTime()
          }
          order.time = new Date(api_order.created_at).getTime()
          order.local_time = new Date().getTime()
          order.status = api_order.status
          //console.log('\ncreated ' + order.status + ' ' + type + ' order: ' + fa(order.size) + ' at ' + fc(order.price) + ' (total ' + fc(n(order.price).multiply(order.size)) + ')\n')
          function checkOrder () {
            if (!s[type + '_order']) {
              var err = new Error('order cancelled')
              err.order = order
              s.exchange.cancelOrder({order_id: order.order_id}, function (cancel_err) {
                if (cancel_err) {
                  console.error('could not cancel order')
                  console.error(cancel_err.body)
                  console.error(cancel_err)
                }
                cb(err)
              })
              return
            }
            s.exchange.getOrder({order_id: order.order_id}, function (err, api_order) {
              if (err) return cb(err)
              order.status = api_order.status
              if (api_order.status === 'done') {
                order.time = new Date(api_order.done_at).getTime()
                executeOrder(order)
                return syncBalance(function () {
                  cb(null, order)
                })
              }
              if (new Date().getTime() - order.local_time >= so.order_adjust_time) {
                s.exchange.cancelOrder({order_id: order.order_id}, function (err) {
                  if (err) {
                    console.error('could not cancel order for adjustment')
                    console.error(err.body)
                    console.error(err)
                  }
                  // wait a bit for settlement
                  setTimeout(function () {
                    cb(null, null)
                  }, so.wait_for_settlement)
                })
              }
              else {
                setTimeout(checkOrder, so.order_poll_time)
              }
            })
          }
          setTimeout(checkOrder, so.order_poll_time)
        })
      }
    }

    function getQuote (cb) {
      if (so.mode === 'sim') {
        return cb(null, {
          bid: s.period.close,
          ask: s.period.close
        })
      }
      else {
        s.exchange.getQuote({product_id: s.product_id}, cb)
      }
    }

    // if s.signal
    // 1. sync balance
    // 2. get quote
    // 3. calculate size/price
    // 4. validate size against min/max sizes
    // 5. cancel old orders
    // 6. place new order
    // 7. record order ID and start poll timer
    // 8. if not filled after timer, repeat process
    // 9. if filled, record order stats
    function executeSignal (signal, _cb, waited_for_settlement) {
      var size, price
      var cb = function (err, order) {
        if (err) {
          if (signal === 'buy') delete s.buy_order
          else delete s.sell_order
          if (_cb) {
            _cb(err)
          }
          else {
            console.error('\n')
            if (err.desc) console.error(err.desc)
            console.error(err)
            console.error('\n')
          }
        }
        else if (_cb) {
          _cb(null, order)
        }
      }
      syncBalance(function (err) {
        if (err) {
          err.desc = 'could not execute ' + signal + ': error syncing balance'
          return cb(err)
        }
        if (signal === 'buy' && Number(s.balance.currency_hold) > 0) {
          if (waited_for_settlement) {
            var err = new Error('funds on hold')
            err.desc = pct(n(s.balance.currency_hold).divide(s.balance.currency).value()) + ' of funds (' + fc(s.balance.currency_hold) + ') on hold'
            return cb(err)
          }
          return setTimeout(function () {
            executeSignal(signal, cb, true)
          }, so.wait_for_settlement)
        }
        else if (signal === 'sell' && Number(s.balance.asset_hold) > 0) {
          if (waited_for_settlement) {
            var err = new Error('funds on hold')
            err.desc = pct(n(s.balance.asset_hold).divide(s.balance.asset).value()) + ' of funds (' + fa(s.balance.asset_hold) + ') on hold'
            return cb(err)
          }
          return setTimeout(function () {
            executeSignal(signal, cb, true)
          }, so.wait_for_settlement)
        }
        getQuote(function (err, quote) {
          if (err) {
            err.desc = 'could not execute ' + signal + ': error fetching quote'
            return cb(err)
          }
          if (signal === 'buy') {
            price = n(quote.bid).subtract(n(quote.bid).multiply(so.markup_pct / 100)).format(String(s.product.increment))
            size = n(s.balance.currency).multiply(so.buy_pct).divide(100).divide(price).format('0.00000000')
            if (Number(size) >= s.product.min_size) {
              if (Number(size) > s.product.max_size) {
                size = s.product.max_size
              }
              if (s.buy_order && so.max_slippage_pct) {
                var slippage = n(price).subtract(s.buy_order.orig_price).divide(s.buy_order.orig_price).multiply(100).value()
                if (slippage > so.max_slippage_pct) {
                  var err = new Error('slippage protection')
                  err.desc = 'refusing to buy at ' + fc(price) + ', slippage of ' + pct(slippage / 100)
                  return cb(err)
                }
              }
              //console.log('\nplacing buy order at ' + fc(price) + ', ' + fc(quote.bid - Number(price)) + ' under best bid\n')
              doOrder()
            }
            else {
              cb(null, null)
            }
          }
          else if (signal === 'sell') {
            price = n(quote.ask).add(n(quote.ask).multiply(so.markup_pct / 100)).format(String(s.product.increment))
            size = n(s.balance.asset).multiply(so.sell_pct / 100).format('0.00000000')
            if (Number(size) >= s.product.min_size) {
              if (Number(size) > s.product.max_size) {
                size = s.product.max_size
              }
              var sell_loss = s.last_buy_price ? (Number(price) - s.last_buy_price) / s.last_buy_price * -100 : null
              if (so.max_sell_loss_pct && sell_loss > so.max_sell_loss_pct) {
                var err = new Error('loss protection')
                err.desc = 'refusing to sell at ' + fc(price) + ', sell loss of ' + pct(sell_loss / 100)
                return cb(err)
              }
              else {
                if (s.sell_order && so.max_slippage_pct) {
                  var slippage = n(s.sell_order.orig_price).subtract(price).divide(price).multiply(100).value()
                  if (slippage > so.max_slippage_pct) {
                    var err = new Error('slippage protection')
                    err.desc = 'refusing to sell at ' + fc(price) + ', slippage of ' + pct(slippage / 100)
                    return cb(err)
                  }
                }
                //console.log('\nplacing sell order at ' + fc(price) + ', ' + fc(Number(price) - quote.bid) + ' over best ask\n')
                doOrder()
              }
            }
            else {
              cb(null, null)
            }
          }
        })
      })
      function doOrder () {
        placeOrder(signal, {
          size: size,
          price: price
        }, function (err, order) {
          if (err) {
            err.desc = 'could not execute ' + signal + ': error placing order'
            return cb(err)
          }
          if (!order) {
            // order timed out and needs adjusting
            return executeSignal(signal, cb)
          }
          cb(null, order)
        })
      }
    }

    function executeOrder (trade) {
      var price
      if (s.buy_order) {
        if (so.mode === 'live' || trade.price <= Number(s.buy_order.price)) {
          price = s.buy_order.price
          if (so.mode !== 'live') {
            s.balance.asset = n(s.balance.asset).add(s.buy_order.size).value()
            s.balance.currency = n(s.balance.currency).subtract(n(price).multiply(s.buy_order.size)).value()
          }
          s.action = 'bought'
          var my_trade = {
            order_id: trade.order_id,
            time: trade.time,
            execution_time: trade.time - s.buy_order.orig_time,
            slippage: n(price).subtract(s.buy_order.orig_price).divide(s.buy_order.orig_price).value(),
            type: 'buy',
            size: n(s.buy_order.size).value(),
            price: n(price).value()
          }
          s.my_trades.push(my_trade)
          if (so.stats) {
            console.log(('\nbuy order completed at ' + moment(trade.time).format('YYYY-MM-DD HH:mm:ss') + ':\n\n' + fa(my_trade.size) + ' at ' + fc(my_trade.price) + '\ntotal ' + fc(my_trade.size * my_trade.price) + '\n' + n(my_trade.slippage).format('0.0000%') + ' slippage (orig. price ' + fc(s.buy_order.orig_price) + ')\nexecution: ' + moment.duration(my_trade.execution_time).humanize() + '\n').cyan)
          }
          s.last_buy_price = my_trade.price
          delete s.buy_order
          delete s.buy_stop
          delete s.sell_stop
          if (!s.acted_on_stop && so.sell_stop_pct) {
            s.sell_stop = n(price).subtract(n(price).multiply(so.sell_stop_pct / 100)).value()
          }
          delete s.profit_stop
          delete s.profit_stop_high
        }
      }
      else if (s.sell_order) {
        if (so.mode === 'live' || trade.price >= s.sell_order.price) {
          price = s.sell_order.price
          if (so.mode !== 'live') {
            s.balance.asset = n(s.balance.asset).subtract(s.sell_order.size).value()
            s.balance.currency = n(s.balance.currency).add(n(price).multiply(s.sell_order.size)).value()
          }
          s.action = 'sold'
          s.signal = null
          var my_trade = {
            order_id: trade.order_id,
            time: trade.time,
            execution_time: trade.time - s.sell_order.orig_time,
            slippage: n(s.sell_order.orig_price).subtract(price).divide(price).value(),
            type: 'sell',
            size: n(s.sell_order.size).value(),
            price: n(price).value()
          }
          s.my_trades.push(my_trade)
          if (so.stats) {
            console.log(('\nsell order completed at ' + moment(trade.time).format('YYYY-MM-DD HH:mm:ss') + ':\n\n' + fa(my_trade.size) + ' at ' + fc(my_trade.price) + '\ntotal ' + fc(my_trade.size * my_trade.price) + '\n' + n(my_trade.slippage).format('0.0000%') + ' slippage (orig. price ' + fc(s.sell_order.orig_price) + ')\nexecution: ' + moment.duration(my_trade.execution_time).humanize() + '\n').cyan)
          }
          s.last_sell_price = my_trade.price
          delete s.sell_order
          delete s.buy_stop
          if (!s.acted_on_stop && so.buy_stop_pct) {
            s.buy_stop = n(price).add(n(price).multiply(so.buy_stop_pct / 100)).value()
          }
          delete s.sell_stop
          delete s.profit_stop
          delete s.profit_stop_high
        }
      }
    }

    function adjustBid (trade) {
      if (so.mode === 'live') return
      if (s.buy_order && trade.time - s.buy_order.time >= so.order_adjust_time) {
        executeSignal('buy')
      }
      else if (s.sell_order && trade.time - s.sell_order.time >= so.order_adjust_time) {
        executeSignal('sell')
      }
    }

    function writeReport (is_progress, blink_off) {
      if (is_progress && typeof blink_off === 'undefined' && s.vol_since_last_blink) {
        s.vol_since_last_blink = 0
        setTimeout(function () {
          writeReport(true, true)
        }, 200)
        setTimeout(function () {
          writeReport(true, false)
        }, 400)
        setTimeout(function () {
          writeReport(true, true)
        }, 600)
        setTimeout(function () {
          writeReport(true, false)
        }, 800)
      }
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
      process.stdout.write(moment(is_progress ? s.period.close_time : tb(s.period.time).resize(so.period).add(1).toMilliseconds()).format('YYYY-MM-DD HH:mm:ss')[is_progress && !blink_off ? 'bgBlue' : 'grey'])
      process.stdout.write(z(16, fc(s.period.close), ' ').yellow)
      if (s.lookback[0]) {
        var diff = (s.period.close - s.lookback[0].close) / s.lookback[0].close
        process.stdout.write(z(8, (diff >= 0 ? '+' : '') + pct(diff), ' ')[diff >= 0 ? 'green' : 'red'])
      }
      else {
        process.stdout.write(z(9, '', ' '))
      }
      process.stdout.write(z(14, n(s.period.volume).format('0.00'), ' ')[is_progress && blink_off ? 'cyan' : 'grey'])
      get('lib.rsi')(s, 'rsi', so.rsi_periods)
      if (typeof s.period.rsi === 'number') {
        var half = 5
        var bar = ''
        var stars = 0
        if (s.period.rsi >= 50) {
          bar += ' '.repeat(half)
          stars = Math.min(Math.round(((s.period.rsi - 50) / 50) * half) + 1, half)
          bar += '+'.repeat(stars).green.bgGreen
          bar += ' '.repeat(half - stars)
        }
        else {
          stars = Math.min(Math.round(((50 - s.period.rsi) / 50) * half) + 1, half)
          bar += ' '.repeat(half - stars)
          bar += '-'.repeat(stars).red.bgRed
          bar += ' '.repeat(half)
        }
        process.stdout.write(' ' + bar)
      }
      else {
        process.stdout.write(' '.repeat(11))
      }
      if (s.strategy.onReport) {
        var cols = s.strategy.onReport.call(s.ctx, s)
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
      var orig_capital = s.orig_capital || s.start_capital
      var orig_price = s.orig_price || s.start_price
      if (orig_capital) {
        process.stdout.write(z(20, fa(s.balance.asset), ' ').white)
        process.stdout.write(z(16, fc(s.balance.currency), ' ').yellow)
        var consolidated = n(s.balance.currency).add(n(s.period.close).multiply(s.balance.asset)).value()
        var profit = (consolidated - orig_capital) / orig_capital
        process.stdout.write(z(9, pct(profit), ' ')[profit >= 0 ? 'green' : 'red'])
        var buy_hold = s.period.close * (orig_capital / orig_price)
        var over_buy_hold_pct = (consolidated - buy_hold) / buy_hold
        process.stdout.write(z(8, (over_buy_hold_pct >= 0 ? '+' : '') + pct(over_buy_hold_pct), ' ')[over_buy_hold_pct >= 0 ? 'green' : 'red'])
      }
      if (!is_progress) {
        process.stdout.write('\n')
      }
    }

    return {
      writeHeader: function () {
        process.stdout.write([
          z(19, 'DATE', ' ').grey,
          z(17, 'PRICE', ' ').grey,
          z(9, 'DIFF', ' ').grey,
          z(15, 'VOL', ' ').grey,
          z(12, 'RSI', ' ').grey,
          z(32, 'ACTIONS', ' ').grey,
          z(25, 'BAL', ' ').grey,
          z(22, 'PROFIT', ' ').grey
        ].join('') + '\n')
      },
      update: function (trades, is_preroll, cb) {
        if (typeof is_preroll === 'function') {
          cb = is_preroll
          is_preroll = false
        }
        trades.sort(function (a, b) {
          if (a.time < b.time) return -1
          if (a.time > b.time) return 1
          return 0
        })
        var tasks = trades.map(function (trade) {
          return function (done) {
            if (s.period && trade.time < s.period.time) {
              return done()
            }
            var period_id = tb(trade.time).resize(so.period).toString()
            var day = tb(trade.time).resize('1d')
            if (s.last_day && s.last_day.toString() && day.toString() !== s.last_day.toString()) {
              s.day_count += day.value - s.last_day.value
            }
            s.last_day = day
            if (!s.period) {
              initBuffer(trade)
            }
            if (period_id !== s.period.period_id) {
              s.strategy.onPeriod.call(s.ctx, s, function () {
                s.acted_on_stop = false
                if (!is_preroll) {
                  if (!so.start || trade.time >= so.start) {
                    executeStop(true)
                    if (s.signal) {
                      executeSignal(s.signal)
                      s.acted_on_trend = true
                    }
                  }
                }
                writeReport()
                s.lookback.unshift(s.period)
                s.action = null
                s.signal = null
                initBuffer(trade)
                withOnPeriod()
              })
            }
            else {
              withOnPeriod()
            }
            function withOnPeriod () {
              onTrade(trade)
              if (!is_preroll && (!so.start || trade.time >= so.start)) {
                if (so.mode !== 'live' && !s.start_capital) {
                  s.start_capital = 0
                  s.start_price = trade.price
                  if (so.asset_capital) {
                    s.start_capital += so.asset_capital * s.start_price
                  }
                  if (so.currency_capital) {
                    s.start_capital += so.currency_capital
                  }
                }
                executeStop()
                if (s.signal) {
                  executeSignal(s.signal)
                  s.signal = null
                }
                if (so.mode !== 'live') {
                  adjustBid(trade)
                  executeOrder(trade)
                }
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
      },

      executeSignal: executeSignal,
      writeReport: writeReport,
      syncBalance: syncBalance
    }
  }
}