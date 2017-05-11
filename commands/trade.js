var tb = require('timebucket')
  , minimist = require('minimist')
  , n = require('numbro')
  , fs = require('fs')
  , path = require('path')
  , spawn = require('child_process').spawn

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('trade [selector]')
      .allowUnknownOption()
      .description('run trading bot against live market data')
      .option('--strategy <name>', 'strategy to use', String, c.strategy)
      .option('--paper', 'use paper trading mode (no real trades will take place)', Boolean, false)
      .option('--currency_capital <amount>', 'for paper trading, amount of start capital in currency', Number, c.currency_capital)
      .option('--asset_capital <amount>', 'for paper trading, amount of start capital in asset', Number, c.asset_capital)
      .option('--buy_pct <pct>', 'buy with this % of currency balance', Number, c.buy_pct)
      .option('--sell_pct <pct>', 'sell with this % of asset balance', Number, c.sell_pct)
      .option('--markup_pct <pct>', '% to mark up or down ask/bid price', Number, c.markup_pct)
      .option('--order_adjust_time <ms>', 'adjust bid/ask on this interval to keep orders competitive', Number, c.order_adjust_time)
      .option('--sell_stop_pct <pct>', 'sell if price drops below this % of bought price', Number, c.sell_stop_pct)
      .option('--buy_stop_pct <pct>', 'buy if price surges above this % of sold price', Number, c.buy_stop_pct)
      .option('--profit_stop_enable_pct <pct>', 'enable trailing sell stop when reaching this % profit', Number, c.profit_stop_enable_pct)
      .option('--profit_stop_pct <pct>', 'maintain a trailing stop this % below the high-water mark of profit', Number, c.profit_stop_pct)
      .option('--max_sell_loss_pct <pct>', 'avoid selling at a loss pct under this float', c.max_sell_loss_pct)
      .option('--max_slippage_pct <pct>', 'avoid selling at a slippage pct above this float', c.max_slippage_pct)
      .option('--rsi_periods <periods>', 'number of periods to calculate RSI at', Number, c.rsi_periods)
      .option('--poll_trades <ms>', 'poll new trades at this interval in ms', Number, c.poll_trades)
      .action(function (selector, cmd) {
        selector = get('lib.normalize-selector')(selector || c.selector)
        var exchange_id = selector.split('.')[0]
        var product_id = selector.split('.')[1]
        var exchange = get('exchanges.' + exchange_id)
        if (!exchange) {
          console.error('cannot trade ' + selector + ': exchange not implemented')
          process.exit(1)
        }
        var s = {options: minimist(process.argv)}
        var so = s.options
        delete so._
        Object.keys(c).forEach(function (k) {
          if (typeof cmd[k] !== 'undefined') {
            so[k] = cmd[k]
          }
        })
        so.selector = selector
        so.mode = 'paper'
        var engine = get('lib.engine')(s)

        var db_cursor, trade_cursor
        var query_start = tb().resize(so.period).subtract(so.min_periods).toMilliseconds()
        var days = Math.ceil((new Date().getTime() - query_start) / 86400000)
        var trades_per_min = 0

        console.log('fetching pre-roll data:')
        var backfiller = spawn(path.resolve(__dirname, '..', 'zenbot.sh'), ['backfill', so.selector, '--days', days])
        backfiller.stdout.pipe(process.stdout)
        backfiller.stderr.pipe(process.stderr)
        backfiller.on('exit', function (code) {
          if (code) {
            process.exit(code)
          }
          function getNext () {
            var opts = {
              query: {
                selector: so.selector
              },
              sort: {time: 1},
              limit: 1000
            }
            if (db_cursor) {
              opts.query.time = {$gt: db_cursor}
            }
            else {
              opts.query.time = {$gte: query_start}
            }
            get('db.trades').select(opts, function (err, trades) {
              if (err) throw err
              if (!trades.length) {
                console.log('---------------------------- STARTING ' + so.mode.toUpperCase() + ' TRADING ----------------------------')
                return setInterval(forwardScan, c.poll_trades)
              }
              engine.update(trades, true, function (err) {
                if (err) throw err
                db_cursor = trades[trades.length - 1].time
                trade_cursor = exchange.getCursor(trades[trades.length - 1])
                setImmediate(getNext)
              })
            })
          }
          engine.writeHeader()
          getNext()
        })

        function forwardScan () {
          var opts = {product_id: product_id, from: trade_cursor}
          exchange.getTrades(opts, function (err, trades) {
            if (err) {
              console.error('\nerr trading selector: ' + so.selector)
              console.error(err)
              if (err.code === 'ETIMEDOUT') {
                console.error('retrying...')
                return
              }
              console.error('aborting!')
              process.exit(1)
            }
            if (trades.length) {
              trades.sort(function (a, b) {
                if (a.time > b.time) return -1
                if (a.time < b.time) return 1
                return 0
              })
              trades.forEach(function (trade) {
                var this_cursor = exchange.getCursor(trade)
                trade_cursor = Math.max(this_cursor, trade_cursor)
              })
              engine.update(trades, function (err) {
                if (err) throw err
                engine.writeReport(true)
              })
            }
            else {
              engine.writeReport(true)
            }
          })
        }
      })
  }
}