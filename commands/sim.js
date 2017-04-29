var path = require('path')
  , tb = require('timebucket')
  , moment = require('moment')
  , z = require('zero-fill')
  , n = require('numbro')
  , colors = require('colors')
  , fs = require('fs')
  , idgen = require('idgen')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('sim <selector> [strategy_file]')
      .description('run a backtest simulation')
      .option('-s, --start <timestamp>', 'start at timestamp (milliseconds)')
      .option('-e, --end <timestamp>', 'end at timestamp (milliseconds)')
      .option('-d, --days <days>', 'start n days ago and end at latest data')
      .action(function (selector, strategy_file, cmd) {
        selector = get('lib.normalize-selector')(selector)
        var strategy = get('lib.load-strategy')(strategy_file)
        if (!cmd.end) {
          cmd.end = new Date().getTime()
        }
        if (cmd.days) {
          cmd.start = cmd.end - (86400000 * cmd.days)
        }
        var s = {
          selector: selector,
          asset: selector.split('.')[1].split('-')[0],
          currency: currency = selector.split('.')[1].split('-')[1],
          start: cmd.start,
          end: cmd.end,
          cursor: null,
          lookback: [],
          last_period_id: null,
          period: {},
          trend: null,
          signal: null,
          acted_on_trend: false,
          start_position: 50,
          buy_hold_start: null,
          day_count: 0,
          last_day: null,
          balance: {},
          my_trades: [],
          last_buy_price: null
        }
        s.balance[s.currency] = strategy.options.start_capital
        s.balance[s.asset] = 0

        function initBuffer (trade) {
          s.period = {
            time: tb(trade.time).resize(strategy.options.period).toMilliseconds(),
            open: trade.price,
            high: trade.price,
            low: trade.price,
            close: trade.price,
            volume: 0,
            close_time: null,
            trend_ema: null,
            trend_ema_rate: null
          }
        }

        function exitSim () {
          var size = s.balance[s.asset]
          s.balance[s.currency] += s.period.close * size
          s.balance[s.asset] = 0
          s.my_trades.push({
            time: s.period.time,
            type: 'sell',
            size: size,
            price: s.period.close
          })
          s.lookback.unshift(s.period)
          console.log(s.balance)
          var buy_hold = s.lookback[0].close * s.buy_hold_start
          console.log('buy hold', n(buy_hold).format('$0.00').yellow)
          console.log('vs. buy hold', n((s.balance[s.currency] - buy_hold) / buy_hold).format('0.00%').yellow)
          console.log(s.my_trades.length + ' trades over ' + s.day_count + ' days (avg ' + n(s.my_trades.length / s.day_count).format('0.0') + ' trades/day)')
          var data = s.lookback.map(function (period) {
            return {
              time: period.time,
              open: period.open,
              high: period.high,
              low: period.low,
              close: period.close,
              volume: period.volume
            }
          })
          var code = 'var data = ' + JSON.stringify(data) + ';\n'
          code += 'var trades = ' + JSON.stringify(s.my_trades) + ';\n'
          var tpl = fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'sim_result.html.tpl'), {encoding: 'utf8'})
          var out = tpl.replace('{{code}}', code).replace('{{trend_ema_period}}', strategy.options.period.trend_ema || 36)
          var id = idgen(8)
          var out_target = 'sim_result_' + id + '.html'
          fs.writeFileSync(out_target, out)
          console.log('wrote', out_target)
          process.exit(0)
        }

        function onTrade (trade) {
          s.period.high = Math.max(trade.price, s.period.high)
          s.period.low = Math.min(trade.price, s.period.low)
          s.period.close = trade.price
          s.period.volume += trade.size
          s.period.close_time = trade.time
          s.cursor = trade.time
          adjustBid(trade)
          executeOrder(trade)
        }

        function generateEma () {
          if (s.lookback.length >= strategy.options.trend_ema) {
            var prev_ema = s.lookback[0].trend_ema
            if (!prev_ema) {
              var sum = 0
              s.lookback.slice(0, strategy.options.trend_ema).forEach(function (period) {
                sum += period.close
              })
              prev_ema = sum / strategy.options.trend_ema
            }
            var multiplier = 2 / (strategy.options.trend_ema + 1)
            s.period.trend_ema = (s.period.close - prev_ema) * multiplier + prev_ema
          }
          if (s.period.trend_ema && s.lookback[0] && s.lookback[0].trend_ema) {
            if (s.period.trend_ema / s.lookback[0].trend_ema >= 1) {
              s.period.trend_ema_rate = (s.period.trend_ema - s.lookback[0].trend_ema) / s.lookback[0].trend_ema * 100
            }
            else {
              s.period.trend_ema_rate = (s.lookback[0].trend_ema - s.period.trend_ema) / s.period.trend_ema * -100
            }
          }
        }

        function generateRsi () {
          if (s.lookback.length >= strategy.options.rsi_periods) {
            var avg_gain = s.lookback[0].avg_gain
            var avg_loss = s.lookback[0].avg_loss
            if (typeof avg_gain === 'undefined') {
              var gain_sum = 0
              var loss_sum = 0
              var last_close
              s.lookback.slice(0, strategy.options.rsi_periods).forEach(function (period) {
                if (last_close) {
                  if (period.close > last_close) {
                    gain_sum += period.close - last_close
                  }
                  else {
                    loss_sum += last_close - period.close
                  }
                }
                last_close = period.close
              })
              s.period.avg_gain = gain_sum / strategy.options.rsi_periods
              s.period.avg_loss = loss_sum / strategy.options.rsi_periods
            }
            else {
              var current_gain = s.period.close - s.lookback[0].close
              s.period.avg_gain = ((avg_gain * (strategy.options.rsi_periods - 1)) + (current_gain > 0 ? current_gain : 0)) / strategy.options.rsi_periods
              var current_loss = s.lookback[0].close - s.period.close
              s.period.avg_loss = ((avg_loss * (strategy.options.rsi_periods - 1)) + (current_loss > 0 ? current_loss : 0)) / strategy.options.rsi_periods
            }
            var rs = s.period.avg_gain / s.period.avg_loss
            s.period.rsi = Math.round(100 - (100 / (1 + rs)))
          }
        }

        function emaSignal () {
          if (s.period.trend_ema_rate && s.lookback[0] && s.lookback[0].trend_ema_rate) {
            if (s.period.trend_ema_rate >= 0) {
              if (s.trend !== 'up') {
                s.acted_on_trend = false
                delete s.sell_order
              }
              s.trend = 'up'
              s.signal = s.acted_on_trend ? null : 'buy'
            }
            else {
              if (s.trend !== 'down') {
                s.acted_on_trend = false
              }
              s.trend = 'down'
              s.signal = s.period.trend_ema_rate > -0.02 && !s.acted_on_trend ? 'sell' : null
              if (s.signal === 'sell') {
                delete s.buy_order
              }
            }
          }
        }

        // @todo: market orders don't apply slippage, or adjust size to prevent overdraw.
        function executeOrder (trade) {
          var price, fee = 0
          if (s.buy_order) {
            if (s.buy_order.type === 'market' || trade.price < s.buy_order.price) {
              price = s.buy_order.type === 'market' ? trade.price : s.buy_order.price
              s.balance[s.asset] += s.buy_order.size
              s.balance[s.currency] -= price * s.buy_order.size
              if (s.buy_order.type === 'market') {
                fee = (price * s.buy_order.size) * (strategy.options.fee_pct / 100)
                s.balance[s.currency] -= fee
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
            }
          }
          else if (s.sell_order) {
            if (s.sell_order.type === 'market' || trade.price > s.sell_order.price) {
              price = s.sell_order.type === 'market' ? trade.price : s.sell_order.price
              s.balance[s.asset] -= s.sell_order.size
              s.balance[s.currency] += price * s.sell_order.size
              if (s.sell_order.type === 'market') {
                fee = (price * s.sell_order.size) * (strategy.options.fee_pct / 100)
                s.balance[s.currency] -= fee
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
            }
          }
        }

        function executeSignal () {
          var size, price
          if (s.signal === 'buy') {
            size = s.balance[s.currency] / s.period.close
            if (size >= 0.01)  {
              price = s.period.close - (s.period.close * (strategy.options.markdown_pct / 100))
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
            size = s.balance[s.asset]
            if (size >= 0.01)  {
              price = s.period.close + (s.period.close * (strategy.options.markup_pct / 100))
              var sell_loss = s.last_buy_price ? ((price / s.last_buy_price) * 100) - 100 : null
              if (sell_loss !== null && sell_loss < strategy.options.max_sell_loss_pct) {
                console.error('refusing to sell at', n(price).format('$0.00'), 'sell loss of', n(sell_loss / 100).format('0.00%'))
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

        function adjustBid (trade) {
          var price
          if (strategy.options.bid_adjust_time && trade.price > 100) {
            if (s.buy_order && trade.time - s.buy_order.time >= strategy.options.bid_adjust_time) {
              price = trade.price - (trade.price * (strategy.options.markdown_pct / 100))
              s.buy_order = {
                size: s.buy_order.size,
                price: price,
                type: 'limit',
                time: trade.time
              }
            }
            else if (s.sell_order && trade.time - s.sell_order.time >= strategy.options.bid_adjust_time) {
              price = trade.price + (trade.price * (strategy.options.markup_pct / 100))
              var sell_loss = s.last_buy_price ? ((price / s.last_buy_price) * 100) - 100 : null
              if (sell_loss !== null && sell_loss < strategy.options.max_sell_loss_pct) {
                console.error('refusing to sell at', n(price).format('$0.00'), 'sell loss of', n(sell_loss / 100).format('0.00%'))
                delete s.sell_order
              }
              else {
                s.sell_order = {
                  size: s.sell_order.size,
                  price: price,
                  type: 'limit',
                  time: trade.time
                }
              }
            }
          }
        }

        function candleReport () {
          process.stdout.write(moment(s.period.time).format('YYYY-MM-DD HH').grey)
          process.stdout.write(z(8, n(s.period.close).format('0.00'), ' ').white)
          if (s.lookback[0]) {
            var diff = s.period.close - s.lookback[0].close
            process.stdout.write(z(8, n(diff).format('0.00'), ' ')[diff >= 0 ? 'green' : 'red'])
          }
          else {
            process.stdout.write(z(8, '', ' '))
          }
          process.stdout.write(z(6, s.trend || 'null', ' ')[s.trend ? s.trend === 'up' ? 'green' : 'red' : 'grey'])
          if (s.period.trend_ema_rate) {
            process.stdout.write(z(8, n(s.period.trend_ema_rate).format('0.0000'), ' ')[s.trend ? s.trend === 'up' ? 'green' : 'red' : 'grey'])
          }
          else {
            process.stdout.write(z(9, '', ' '))
          }
          if (s.period.rsi) {
            var rsi_color = 'grey'
            if (s.period.rsi >= 70) rsi_color = 'green'
            else if (s.period.rsi <= 30) rsi_color = 'red'
            process.stdout.write(z(3, s.period.rsi, ' ')[rsi_color])
          }
          else {
            process.stdout.write(z(3, '', ' '))
          }
          process.stdout.write(z(9, s.signal || 'null', ' ')[s.signal ? s.signal === 'buy' ? 'green' : 'red' : 'grey'])
          if (s.buy_order) {
            process.stdout.write(z(9, 'buying', ' ').green)
            process.stdout.write(z(8, n(s.buy_order.price).format('0.00'), ' ').green)
          }
          else if (s.sell_order) {
            process.stdout.write(z(9, 'selling', ' ').red)
            process.stdout.write(z(8, n(s.sell_order.price).format('0.00'), ' ').red)
          }
          else {
            process.stdout.write(z(9, '', ' '))
            process.stdout.write(z(9, '', ' '))
          }
          process.stdout.write(z(9, s.action || 'null', ' ')[s.action ? s.action === 'bought' ? 'green' : 'red' : 'grey'])
          process.stdout.write(z(9, n(s.balance[s.asset]).format('0.0000'), ' ').white)
          process.stdout.write(z(10, n(s.balance[s.currency]).format('$0.00'), ' ').yellow)
          var consolidated = s.balance[s.currency] + (s.period.close * s.balance[s.asset])
          var profit = (consolidated - strategy.options.start_capital) / strategy.options.start_capital
          process.stdout.write(z(8, n(profit).format('0.00%'), ' ')[profit >= 0 ? 'green' : 'red'])
          process.stdout.write('\n')
        }

        function onCandle () {
          generateEma()
          generateRsi()
          emaSignal()
          executeSignal()
          candleReport()
          s.lookback.unshift(s.period)
          s.action = null
        }

        function getNext () {
          var opts = {
            query: {
              selector: selector,
              time: {$lte: s.end}
            },
            order: {time: 1},
            limit: 1000
          }
          if (s.cursor) {
            opts.query.time['$gt'] = s.cursor
          }
          else if (s.start) {
            opts.query.time['$gte'] = Number(s.start)
          }
          get('db.trades').select(opts, function (err, trades) {
            if (err) throw err
            if (!trades.length) {
              exitSim()
            }
            trades.sort(function (a, b) {
              if (a.time < b.time) return -1
              if (a.time > b.time) return 1
              return 0
            })
            trades.forEach(function (trade) {
              var period_id = tb(trade.time).resize(strategy.options.period).toString()
              var day = tb(trade.time).resize('1d')
              if (s.last_day && s.last_day.toString() && day.toString() !== s.last_day.toString()) {
                s.day_count += day.value - s.last_day.value
              }
              s.last_day = day
              if (!s.last_period_id) {
                initBuffer(trade)
                s.last_period_id = period_id
                s.buy_hold_start = s.balance[s.currency] / trade.price
              }
              if (period_id !== s.last_period_id) {
                onCandle()
                initBuffer(trade)
              }
              onTrade(trade)
              s.last_period_id = period_id
            })
            setImmediate(getNext)
          })
        }

        getNext()
      })
  }
}