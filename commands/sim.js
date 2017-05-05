var path = require('path')
  , tb = require('timebucket')
  , moment = require('moment')
  , z = require('zero-fill')
  , n = require('numbro')
  , colors = require('colors')
  , fs = require('fs')
  , idgen = require('idgen')
  , series = require('run-series')
  , minimist = require('minimist')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('sim <selector>')
      .allowUnknownOption()
      .description('run a simulation on backfilled data')
      .option('--strategy <name>', 'strategy to use', String, c.strategy)
      .option('--start <timestamp>', 'start at timestamp (milliseconds)')
      .option('--end <timestamp>', 'end at timestamp (milliseconds)')
      .option('--days <days>', 'start n days ago and end at latest data')
      .option('--start_capital <amount>', 'amount of start capital in currency', Number, 1000, c.start_capital)
      .option('--markup_pct <pct>', '% to mark up or down ask/bid price', Number, c.markup_pct)
      .option('--order_adjust_time <ms>', 'adjust bid/ask on this interval to keep orders competitive', Number, c.order_adjust_time)
      .option('--sell_stop_pct <pct>', 'sell if price drops below this % of bought price', Number, c.sell_stop_pct)
      .option('--sell_stop_max_pct <pct>', 'don\'t do sell stops below this % of bought price', Number, c.sell_stop_pct)
      .option('--buy_stop_pct <pct>', 'buy if price surges above this % of sold price', Number, c.buy_stop_pct)
      .option('--profit_stop_enable_pct <pct>', 'enable trailing sell stop when reaching this % profit', Number, c.profit_stop_enable_pct)
      .option('--profit_stop_pct <pct>', 'maintain a trailing stop this % below the high-water mark of profit', Number, c.profit_stop_pct)
      .option('--max_sell_loss_pct <pct>', 'avoid selling at a loss pct under this float', c.max_sell_loss_pct)
      .option('--symmetrical', 'reverse time at the end of the graph, normalizing buy/hold to 0', Boolean, false)
      .action(function (selector, cmd) {
        var argv = minimist(process.argv)
        selector = get('lib.normalize-selector')(selector)
        try {
          var strategy = get('strategies.' + cmd.strategy)
        }
        catch (e) {
          console.error('error loading strategy')
          throw e
        }
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
          last_buy_price: null,
          options: {}
        }

        // set up options augmented by strategy
        var ctx = {
          option: function (name, desc, type, def) {
            if (typeof argv[name] !== 'undefined') {
              s.options[name] = argv[name]
            }
            else {
              s.options[name] = def
            }
          }
        }
        if (strategy.getOptions) {
          strategy.getOptions.call(ctx)
        }
        Object.keys(c).forEach(function (k) {
          if (k.indexOf('mongo_') !== -1) return
          if (typeof argv[k] !== 'undefined') {
            s.options[k] = argv[k]
          }
          else {
            s.options[k] = c[k]
          }
        })
        console.log(s.options)

        s.balance[s.currency] = s.options.start_capital
        s.balance[s.asset] = 0

        function initBuffer (trade) {
          s.period = {
            time: tb(trade.time).resize(s.options.period).toMilliseconds(),
            open: trade.price,
            high: trade.price,
            low: trade.price,
            close: trade.price,
            volume: 0,
            close_time: null
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
          var profit = (s.balance[s.currency] - s.options.start_capital) / s.options.start_capital
          console.log('end balance', n(s.balance[s.currency]).format('$0.00').yellow + ' (' + n(profit).format('0.00%') + ')')
          var buy_hold = s.lookback[0].close * s.buy_hold_start
          var buy_hold_profit = (buy_hold - s.options.start_capital) / s.options.start_capital
          console.log('buy hold', n(buy_hold).format('$0.00').yellow + ' (' + n(buy_hold_profit).format('0.00%') + ')')
          console.log('vs. buy hold', n(profit - buy_hold_profit).format('0.00%').yellow)
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
          var out = tpl.replace('{{code}}', code).replace('{{trend_ema_period}}', s.options.trend_ema || 36)
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
          s.cursor = trade.orig_time || trade.time
          var stop_signal
          if (s.my_trades.length) {
            var last_trade = s.my_trades[s.my_trades.length - 1]
            s.last_trade_worth = last_trade.type === 'buy' ? (s.period.close / last_trade.price) - 1 : (last_trade.price / s.period.close) - 1
            if (!s.acted_on_stop) {
              if (last_trade.type === 'buy') {
                if (s.sell_stop && s.period.close < s.sell_stop && (!s.options.sell_stop_max_pct || (s.last_trade_worth * -100 < s.options.sell_stop_max_pct))) {
                  stop_signal = 'sell'
                  console.log('sell stop triggered at ' + n(s.last_trade_worth).format('0.00%') + ' trade worth')
                }
                else if (s.options.profit_stop_enable_pct && s.last_trade_worth >= (s.options.profit_stop_enable_pct / 100)) {
                  s.profit_stop_high = Math.max(s.profit_stop_high || s.period.close, s.period.close)
                  s.profit_stop = s.profit_stop_high - (s.profit_stop_high * (s.options.profit_stop_pct / 100))
                }
                if (s.profit_stop && s.period.close < s.profit_stop) {
                  stop_signal = 'sell'
                  console.log('profit stop triggered at ' + n(s.last_trade_worth).format('0.00%') + ' trade worth')
                }
              }
              else {
                if (s.buy_stop && s.period.close > s.buy_stop) {
                  stop_signal = 'buy'
                  console.log('buy stop triggered at ' + n(s.last_trade_worth).format('0.00%') + ' trade worth')
                }
              }
            }
          }
          if (stop_signal) {
            s.signal = stop_signal
            s.acted_on_stop = true
            executeSignal()
          }
          adjustBid(trade)
          executeOrder(trade)
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
                fee = (price * s.buy_order.size) * (s.options.fee_pct / 100)
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
              delete s.buy_stop
              delete s.sell_stop
              if (!s.acted_on_stop && s.options.sell_stop_pct) {
                s.sell_stop = price - (price * (s.options.sell_stop_pct / 100))
              }
              delete s.profit_stop
              delete s.profit_stop_high
              s.acted_on_stop = false
            }
          }
          else if (s.sell_order) {
            if (s.sell_order.type === 'market' || trade.price > s.sell_order.price) {
              price = s.sell_order.type === 'market' ? trade.price : s.sell_order.price
              s.balance[s.asset] -= s.sell_order.size
              s.balance[s.currency] += price * s.sell_order.size
              if (s.sell_order.type === 'market') {
                fee = (price * s.sell_order.size) * (s.options.fee_pct / 100)
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
              delete s.buy_stop
              if (!s.acted_on_stop && s.options.buy_stop_pct) {
                s.buy_stop = price + (price * (s.options.buy_stop_pct / 100))
              }
              delete s.sell_stop
              delete s.profit_stop
              delete s.profit_stop_high
              s.acted_on_stop = false
            }
          }
        }

        function executeSignal () {
          var size, price
          if (s.signal === 'buy') {
            size = s.balance[s.currency] / s.period.close
            if (size >= 0.01)  {
              price = s.period.close - (s.period.close * (s.options.markup_pct / 100))
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
              price = s.period.close + (s.period.close * (s.options.markup_pct / 100))
              var sell_loss = s.last_buy_price ? (1 - (price / s.last_buy_price)) * 100 : null
              if (s.options.max_sell_loss_pct && sell_loss > s.options.max_sell_loss_pct) {
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
          if (s.options.order_adjust_time) {
            if (s.buy_order && trade.time - s.buy_order.time >= s.options.order_adjust_time) {
              price = trade.price - (trade.price * (s.options.markup_pct / 100))
              s.buy_order = {
                size: s.buy_order.size,
                price: price,
                type: 'limit',
                time: trade.time
              }
            }
            else if (s.sell_order && trade.time - s.sell_order.time >= s.options.order_adjust_time) {
              price = trade.price + (trade.price * (s.options.markup_pct / 100))
              var sell_loss = s.last_buy_price ? (1 - (price / s.last_buy_price)) * 100 : null
              if (s.options.max_sell_loss_pct && sell_loss > s.options.max_sell_loss_pct) {
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

        function writeReport () {
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
          if (strategy.onReport) {
            var cols = strategy.onReport.call(ctx, s)
            cols.forEach(function (col) {
              process.stdout.write(col)
            })
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
          if (s.action) {
            process.stdout.write(z(10, s.action, ' ')[s.action === 'bought' ? 'green' : 'red'])
          }
          else if (s.last_trade_worth) {
            process.stdout.write(z(9, n(s.last_trade_worth).format('0.0000%'), ' ')[s.last_trade_worth > 0 ? 'green' : 'red'])
          }
          else {
            process.stdout.write(z(10, '', ' '))
          }
          process.stdout.write(z(9, n(s.balance[s.asset]).format('0.0000'), ' ').white)
          process.stdout.write(z(10, n(s.balance[s.currency]).format('$0.00'), ' ').yellow)
          var consolidated = s.balance[s.currency] + (s.period.close * s.balance[s.asset])
          var profit = (consolidated - s.options.start_capital) / s.options.start_capital
          process.stdout.write(z(8, n(profit).format('0.00%'), ' ')[profit >= 0 ? 'green' : 'red'])
          process.stdout.write('\n')
        }

        function getNext () {
          var opts = {
            query: {
              selector: selector,
              time: {$lte: s.end}
            },
            sort: {time: 1},
            limit: 1000
          }
          if (s.cursor) {
            if (s.reversing) {
              opts.query.time = {}
              opts.query.time['$lt'] = s.cursor
              if (s.start) {
                opts.query.time['$gte'] = Number(s.start)
              }
              opts.sort = {time: -1}
            }
            else {
              opts.query.time['$gt'] = s.cursor
            }
          }
          else if (s.start) {
            opts.query.time['$gte'] = Number(s.start)
          }
          get('db.trades').select(opts, function (err, trades) {
            if (err) throw err
            if (!trades.length) {
              if (s.options.symmetrical && !s.reversing) {
                s.reversing = true
                s.reverse_point = s.cursor
                return getNext()
              }
              exitSim()
            }
            if (s.options.symmetrical && s.reversing) {
              trades.forEach(function (trade) {
                trade.orig_time = trade.time
                trade.time = s.reverse_point + (s.reverse_point - trade.time)
              })
            }
            trades.sort(function (a, b) {
              if (a.time < b.time) return -1
              if (a.time > b.time) return 1
              return 0
            })
            var tasks = trades.map(function (trade) {
              return function (cb) {
                var period_id = tb(trade.time).resize(s.options.period).toString()
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
                  strategy.onPeriod.call(ctx, s, function () {
                    executeSignal()
                    writeReport()
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
                  s.last_period_id = period_id
                  setImmediate(cb)
                }
              }
            })
            series(tasks, function () {
              setImmediate(getNext)
            })
          })
        }

        getNext()
      })
  }
}