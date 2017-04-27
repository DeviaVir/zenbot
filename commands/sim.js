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
          start_position: 50,
          buy_hold_start: null
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
              process.exit(0)
            }
            trades.sort(function (a, b) {
              if (a.time < b.time) return -1
              if (a.time > b.time) return 1
              return 0
            })
            trades.forEach(function (trade) {
              var period_id = tb(trade.time).resize(strategy.options.period).toString()
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
                  if (s.period_buffer.trend_ema && s.lookback[0].trend_ema) {
                    if (s.period_buffer.trend_ema / s.lookback[0].trend_ema >= 1) {
                      s.trend = 'up'
                      s.trend_rate = (s.period_buffer.trend_ema - s.lookback[0].trend_ema) / s.lookback[0].trend_ema * 100
                    }
                    else {
                      s.trend = 'down'
                      s.trend_rate = (s.lookback[0].trend_ema - s.period_buffer.trend_ema) / s.period_buffer.trend_ema * -100
                    }
                    if (s.trend_rate >= 0 && s.trend_rate < 0.01) {
                      s.trend = null
                    }
                    else if (s.trend_rate < 0 && s.trend_rate > -0.01) {
                      s.trend = null
                    }
                    var action
                    if (s.trend === 'up') {
                      var size = s.balance[currency] / trade.price
                      if (size >= 0.01 && s.balance[currency] - (trade.price * size) >= 0)  {
                        s.balance[asset] += size
                        s.balance[currency] -= trade.price * size
                        action = 'bought'
                      }
                    }
                    else if (s.trend === 'down') {
                      var size = s.balance[asset]
                      if (size >= 0.01 && s.balance[asset] - size >= 0 && trade.price > 100)  {
                        s.balance[asset] -= size
                        s.balance[currency] += trade.price * size
                        action = 'sold'
                      }
                    }
                    process.stdout.write(moment(s.period_buffer.time).format('YYYY-MM-DD HH').grey)
                    process.stdout.write(z(8, n(s.period_buffer.close).format('0.00'), ' ').white)
                    var diff = s.period_buffer.close - s.lookback[0].close
                    process.stdout.write(z(8, n(diff).format('0.00'), ' ')[diff >= 0 ? 'green' : 'red'])
                    process.stdout.write(z(6, s.trend || 'null', ' ')[s.trend ? s.trend === 'up' ? 'green' : 'red' : 'grey'])
                    process.stdout.write(z(9, n(s.trend_rate).format('0.0000'), ' ')[s.trend ? s.trend === 'up' ? 'green' : 'red' : 'grey'])
                    process.stdout.write(z(9, action || 'null', ' ')[action ? action === 'bought' ? 'green' : 'red' : 'grey'])
                    process.stdout.write(z(9, n(s.balance[asset]).format('0.0000'), ' ').white)
                    process.stdout.write(z(10, n(s.balance[currency]).format('$0.00'), ' ').yellow)
                    var consolidated = s.balance[currency] + (trade.price * s.balance[asset])
                    var profit = (consolidated - strategy.options.start_capital) / strategy.options.start_capital
                    process.stdout.write(z(7, n(profit).format('0.00%'), ' ')[profit >= 0 ? 'green' : 'red'])
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