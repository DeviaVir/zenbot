var tb = require('timebucket')
  , minimist = require('minimist')
  , n = require('numbro')
  , fs = require('fs')
  , path = require('path')
  , spawn = require('child_process').spawn
  , moment = require('moment')
  , crypto = require('crypto')

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
      .option('--disable_stats', 'disable printing order stats')
      .option('--reset_profit', 'start new profit calculation from 0')
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
        so.stats = !cmd.disable_stats
        so.selector = selector
        so.mode = so.paper ? 'paper' : 'live'
        var engine = get('lib.engine')(s)

        var db_cursor, trade_cursor
        var query_start = tb().resize(so.period).subtract(so.min_periods * 2).toMilliseconds()
        var days = Math.ceil((new Date().getTime() - query_start) / 86400000)
        var trades_per_min = 0
        var session = null
        var sessions = get('db.sessions')
        var balances = get('db.balances')
        var trades = get('db.trades')
        get('db.mongo').collection('trades').ensureIndex({selector: 1, time: 1})
        var resume_markers = get('db.resume_markers')
        get('db.mongo').collection('resume_markers').ensureIndex({selector: 1, to: -1})
        var marker = {
          id: crypto.randomBytes(4).toString('hex'),
          selector: selector,
          from: null,
          to: null,
          oldest_time: null
        }
        var lookback_size = 0
        var my_trades_size = 0
        var my_trades = get('db.my_trades')
        var periods = get('db.periods')

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
                engine.syncBalance(function (err) {
                  if (err) {
                    if (err.desc) console.error(err.desc)
                    if (err.body) console.error(err.body)
                    throw err
                  }
                  session = {
                    id: crypto.randomBytes(4).toString('hex'),
                    selector: selector,
                    started: new Date().getTime(),
                    mode: so.mode,
                    options: so
                  }
                  sessions.select({query: {selector: selector}, limit: 1, sort: {started: -1}}, function (err, prev_sessions) {
                    if (err) throw err
                    var prev_session = prev_sessions[0]
                    if (prev_session && !cmd.reset_profit) {
                      if (prev_session.orig_capital && prev_session.orig_price && ((so.mode === 'paper' && !cmd.currency_capital && !cmd.asset_capital) || (so.mode === 'live' && prev_session.balance.asset == s.balance.asset && prev_session.balance.currency == s.balance.currency))) {
                        s.orig_capital = session.orig_capital = prev_session.orig_capital
                        s.orig_price = session.orig_price = prev_session.orig_price
                      }
                    }
                    lookback_size = s.lookback.length
                    forwardScan()
                    setInterval(forwardScan, c.poll_trades)
                  })
                })
                return
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

        var prev_timeout = null
        function forwardScan () {
          function saveSession () {
            engine.syncBalance(function (err) {
              if (err) {
                console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - error syncing balance')
                if (err.desc) console.error(err.desc)
                if (err.body) console.error(err.body)
                console.error(err)
              }
              session.updated = new Date().getTime()
              session.balance = s.balance
              session.start_capital = s.start_capital
              session.start_price = s.start_price
              session.num_trades = s.my_trades.length
              if (!session.orig_capital) session.orig_capital = s.start_capital
              if (!session.orig_price) session.orig_price = s.start_price
              if (s.period) {
                session.price = s.period.close
                var d = tb().resize(c.balance_snapshot_period)
                var b = {
                  id: selector + '-' + d.toString(),
                  selector: selector,
                  time: d.toMilliseconds(),
                  currency: s.balance.currency,
                  asset: s.balance.asset,
                  price: s.period.close,
                  start_capital: session.orig_capital,
                  start_price: session.orig_price,
                }
                b.consolidated = n(s.balance.asset).multiply(s.period.close).add(s.balance.currency).value()
                b.profit = (b.consolidated - session.orig_capital) / session.orig_capital
                b.buy_hold = s.period.close * (session.orig_capital / session.orig_price)
                b.buy_hold_profit = (b.buy_hold - session.orig_capital) / session.orig_capital
                b.vs_buy_hold = (b.consolidated - b.buy_hold) / b.buy_hold
                if (so.mode === 'live') {
                  balances.save(b, function (err) {
                    if (err) {
                      console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - error saving balance')
                      console.error(err)
                    }
                  })
                }
                session.balance = b
              }
              else {
                session.balance = {
                  currency: s.balance.currency,
                  asset: s.balance.asset
                }
              }
              sessions.save(session, function (err) {
                if (err) {
                  console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - error saving session')
                  console.error(err)
                }
                engine.writeReport(true)
              })
            })
          }
          var opts = {product_id: product_id, from: trade_cursor}
          exchange.getTrades(opts, function (err, trades) {
            if (err) {
              if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
                if (prev_timeout) {
                  console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - getTrades request timed out. retrying...')
                }
                prev_timeout = true
              }
              else if (err.code === 'HTTP_STATUS') {
                if (prev_timeout) {
                  console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - getTrades request failed: ' + err.message + '. retrying...')
                }
                prev_timeout = true
              }
              else {
                console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - getTrades request failed. retrying...')
                console.error(err)
              }
              return
            }
            prev_timeout = null
            if (trades.length) {
              trades.sort(function (a, b) {
                if (a.time > b.time) return -1
                if (a.time < b.time) return 1
                return 0
              })
              trades.forEach(function (trade) {
                var this_cursor = exchange.getCursor(trade)
                trade_cursor = Math.max(this_cursor, trade_cursor)
                saveTrade(trade)
              })
              engine.update(trades, function (err) {
                if (err) {
                  console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - error saving session')
                  console.error(err)
                }
                resume_markers.save(marker, function (err) {
                  if (err) {
                    console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - error saving marker')
                    console.error(err)
                  }
                })
                if (s.my_trades.length > my_trades_size) {
                  s.my_trades.slice(my_trades_size).forEach(function (my_trade) {
                    my_trade.id = crypto.randomBytes(4).toString('hex')
                    my_trade.selector = selector
                    my_trade.session_id = session.id
                    my_trade.mode = so.mode
                    my_trades.save(my_trade, function (err) {
                      if (err) {
                        console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - error saving my_trade')
                        console.error(err)
                      }
                    })
                  })
                  my_trades_size = s.my_trades.length
                }
                function savePeriod (period) {
                  if (!period.id) {
                    period.id = crypto.randomBytes(4).toString('hex')
                    period.selector = selector
                    period.session_id = session.id
                  }
                  periods.save(period, function (err) {
                    if (err) {
                      console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - error saving my_trade')
                      console.error(err)
                    }
                  })
                }
                if (s.lookback.length > lookback_size) {
                  savePeriod(s.lookback[0])
                  lookback_size = s.lookback.length
                }
                if (s.period) {
                  savePeriod(s.period)
                }
                saveSession()
              })
            }
            else {
              saveSession()
            }
          })
          function saveTrade (trade) {
            trade.id = selector + '-' + String(trade.trade_id)
            trade.selector = selector
            if (!marker.from) {
              marker.from = trade_cursor
              marker.oldest_time = trade.time
              marker.newest_time = trade.time
            }
            marker.to = marker.to ? Math.max(marker.to, trade_cursor) : trade_cursor
            marker.newest_time = Math.max(marker.newest_time, trade.time)
            trades.save(trade, function (err) {
              if (err) {
                console.error('\n' + moment().format('YYYY-MM-DD HH:mm:ss') + ' - error saving trade')
                console.error(err)
              }
            })
          }
        }
      })
  }
}