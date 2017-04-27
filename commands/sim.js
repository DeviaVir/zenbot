var path = require('path')
  , tb = require('timebucket')
  , moment = require('moment')
  , z = require('zero-fill')
  , n = require('numbro')
  , colors = require('colors')

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
          start: cmd.start,
          end: cmd.end,
          cursor: null,
          lookback: [],
          last_period_id: null,
          period_buffer: {},
          trend: null,
          signal: null,
          start_position: 50,
          buy_hold_start: null,
          day_count: 0,
          trade_count: 0,
          last_day_id: null
        }
        var asset = selector.split('.')[1].split('-')[0]
        var currency = selector.split('.')[1].split('-')[1]
        s.balance = {}
        s.balance[currency] = strategy.options.start_capital
        s.balance[asset] = 0
        function initBuffer (trade) {
          s.period_buffer = {
            time: tb(trade.time).resize(strategy.options.period).toMilliseconds(),
            open: trade.price,
            high: trade.price,
            low: trade.price,
            close: trade.price,
            volume: 0
          }
        }
        getNext()
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
              s.balance[currency] += s.lookback[0].close * s.balance[asset]
              s.balance[asset] = 0
              console.log(s.balance)
              var buy_hold = s.lookback[0].close * s.buy_hold_start
              console.log('buy hold', n(buy_hold).format('$0.00').yellow)
              console.log('vs. buy hold', n((s.balance[currency] - buy_hold) / buy_hold).format('0.00%').yellow)
              console.log(s.trade_count + ' trades over ' + s.day_count + ' days (avg ' + n(s.trade_count / s.day_count).format('0.0') + ' trades/day)')
              process.exit(0)
            }
            trades.sort(function (a, b) {
              if (a.time < b.time) return -1
              if (a.time > b.time) return 1
              return 0
            })
            trades.forEach(function (trade) {
              var period_id = tb(trade.time).resize(strategy.options.period).toString()
              var day_id = tb(trade.time).resize('1d').toString()
              if (s.last_day_id && day_id !== s.last_day_id) {
                s.day_count++
              }
              s.last_day_id = day_id
              if (!s.last_period_id) {
                initBuffer(trade)
                s.last_period_id = period_id
                var init_buy_size = s.balance[currency] * (s.start_position / 100) / trade.price
                s.buy_hold_start = s.balance[currency] / trade.price
                s.balance[asset] = init_buy_size
                s.balance[currency] -= init_buy_size * trade.price
              }
              if (period_id !== s.last_period_id) {
                if (s.lookback.length >= strategy.options.min_lookback) {
                  ['trend_ema', 'price_ema'].forEach(function (k) {
                    var prev_ema = s.lookback[0][k]
                    if (!prev_ema) {
                      var sum = 0
                      s.lookback.slice(0, strategy.options[k]).forEach(function (period) {
                        sum += period.close
                      })
                      prev_ema = sum / strategy.options[k]
                    }
                    var multiplier = 2 / (strategy.options[k] + 1)
                    s.period_buffer[k] = (s.period_buffer.close - prev_ema) * multiplier + prev_ema
                  })
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
                    s.period_buffer.avg_gain = gain_sum / strategy.options.rsi_periods
                    s.period_buffer.avg_loss = loss_sum / strategy.options.rsi_periods
                  }
                  else {
                    var current_gain = s.period_buffer.close - s.lookback[0].close
                    s.period_buffer.avg_gain = ((avg_gain * (strategy.options.rsi_periods - 1)) + (current_gain > 0 ? current_gain : 0)) / strategy.options.rsi_periods
                    var current_loss = s.lookback[0].close - s.period_buffer.close
                    s.period_buffer.avg_loss = ((avg_loss * (strategy.options.rsi_periods - 1)) + (current_loss > 0 ? current_loss : 0)) / strategy.options.rsi_periods
                  }
                  var rs = s.period_buffer.avg_gain / s.period_buffer.avg_loss
                  s.period_buffer.rsi = Math.round(100 - (100 / (1 + rs)))
                  if (s.period_buffer.trend_ema && s.lookback[0].trend_ema) {
                    if (s.period_buffer.trend_ema / s.lookback[0].trend_ema >= 1) {
                      s.trend = 'up'
                      s.signal = 'buy'
                      s.trend_rate = (s.period_buffer.trend_ema - s.lookback[0].trend_ema) / s.lookback[0].trend_ema * 100
                    }
                    else {
                      s.trend = 'down'
                      s.signal = 'sell'
                      s.trend_rate = (s.lookback[0].trend_ema - s.period_buffer.trend_ema) / s.period_buffer.trend_ema * -100
                    }
                    if (s.signal === 'buy' && s.trend_rate >= 0.05) {
                      //s.signal = null
                    }
                    else if (s.signal === 'sell' && s.trend_rate <= -0.03) {
                      s.signal = null
                    }
                    /*
                    if (s.period_buffer.rsi >= 70) {
                      s.signal = 'sell'
                    }
                    else if (s.period_buffer.rsi <= 30) {
                      s.signal = 'buy'
                    }
                    else {
                      s.signal = null
                    }
                    */
                    var action
                    if (s.signal === 'buy') {
                      var size = s.balance[currency] / trade.price
                      if (size >= 0.01 && s.balance[currency] - (trade.price * size) >= 0 && trade.price > 100)  {
                        s.balance[asset] += size
                        s.balance[currency] -= trade.price * size
                        action = 'bought'
                        s.signal = null
                        s.trade_count++
                      }
                    }
                    else if (s.signal === 'sell') {
                      var size = s.balance[asset]
                      if (size >= 0.01 && s.balance[asset] - size >= 0 && trade.price > 100)  {
                        s.balance[asset] -= size
                        s.balance[currency] += trade.price * size
                        action = 'sold'
                        s.signal = null
                        s.trade_count++
                      }
                    }
                    process.stdout.write(moment(s.period_buffer.time).format('YYYY-MM-DD HH').grey)
                    process.stdout.write(z(8, n(s.period_buffer.close).format('0.00'), ' ').white)
                    var diff = s.period_buffer.close - s.lookback[0].close
                    process.stdout.write(z(8, n(diff).format('0.00'), ' ')[diff >= 0 ? 'green' : 'red'])
                    process.stdout.write(z(6, s.trend || 'null', ' ')[s.trend ? s.trend === 'up' ? 'green' : 'red' : 'grey'])
                    process.stdout.write(z(9, n(s.trend_rate).format('0.0000'), ' ')[s.trend ? s.trend === 'up' ? 'green' : 'red' : 'grey'])
                    var rsi_color = 'grey'
                    if (s.period_buffer.rsi >= 70) rsi_color = 'green'
                    else if (s.period_buffer.rsi <= 30) rsi_color = 'red'
                    process.stdout.write(z(3, s.period_buffer.rsi, ' ')[rsi_color])
                    process.stdout.write(z(9, action || 'null', ' ')[action ? action === 'bought' ? 'green' : 'red' : 'grey'])
                    process.stdout.write(z(9, n(s.balance[asset]).format('0.0000'), ' ').white)
                    process.stdout.write(z(10, n(s.balance[currency]).format('$0.00'), ' ').yellow)
                    var consolidated = s.balance[currency] + (trade.price * s.balance[asset])
                    var profit = (consolidated - strategy.options.start_capital) / strategy.options.start_capital
                    process.stdout.write(z(8, n(profit).format('0.00%'), ' ')[profit >= 0 ? 'green' : 'red'])
                    process.stdout.write('\n')
                  }
                }
                s.lookback.unshift(s.period_buffer)
                if (s.lookback.length > strategy.options.min_lookback) {
                  s.lookback.pop()
                }
                initBuffer(trade)
              }
              s.period_buffer.high = Math.max(trade.price, s.period_buffer.high)
              s.period_buffer.low = Math.min(trade.price, s.period_buffer.low)
              s.period_buffer.close = trade.price
              s.period_buffer.volume += trade.size
              s.last_period_id = period_id
              s.cursor = trade.time
            })
            getNext()
          })
        }
      })
  }
}