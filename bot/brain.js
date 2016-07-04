var n = require('numeral')
  , colors = require('colors')
  , tb = require('timebucket')
  , zerofill = require('zero-fill')
  , moment = require('moment')
  , constants = require('../conf/constants.json')
  , gleak = require('../utils/gleak')

module.exports = function container (get, set, clear) {
  var get_time = get('utils.get_time')
  var bot = get('bot')
  var start_balance = constants.sim_start_balance
  var rs = {
    id: constants.product_id,
    asset: 0,
    currency: start_balance,
    side: null,
    period_vol: 0,
    running_vol: 0,
    running_total: 0,
    high: 0,
    low: 10000,
    vol: 0,
    max_diff: 0,
    buy_price: null,
    sell_price: null,
    trade_vol: 0,
    cooldown: 0,
    last_tick: null,
    vol_diff_string: '',
    last_hour: null,
    hour_vol: 0,
    first_tick: null,
    num_trades: 0
  }
  if (bot.tweet) {
    var twitter_client = get('utils.twitter_client')
    function onTweet (err, data, response) {
      if (err) return get('console').error('tweet err', err)
      if (response.statusCode === 200 && data && data.id_str) {
        get('console').info('tweeted: '.cyan + data.text.white)
      }
      else get('console').error('tweet err', response.statusCode, data)
    }
  }
  if (bot.sim) {
    bot.trade = true
  }
  if (bot.trade) {
    var client = get('utils.authed_client')
    get('console').info('entering zen mode...')
    syncBalance(function (err) {
      if (err) throw err
      bot.trade = false
      get('utils.client').getProductTicker(function (err, resp, ticker) {
        if (err) throw err
        if (resp.statusCode !== 200) {
          console.error(ticker)
          throw new Error('non-200 status from exchange: ' + resp.statusCode)
        }
        get('db.mems').load(rs.id, function (err, mem) {
          if (err) throw err
          if (mem) {
            Object.keys(mem).forEach(function (k) {
              if (k.match(/^(asset|currency)$/)) return
              rs[k] = mem[k]
            })
            get('console').info('memory loaded.'.white + ' resuming trading!'.cyan)
            finish()
          }
          else {
            get('console').info('no memory found.'.red + ' starting trading!'.cyan)
            finish()
          }
          function finish () {
            start_balance = n(rs.asset).multiply(ticker.price).add(rs.currency).value()
            bot.trade = true
          }
        })
      })
    })
  }
  function syncLearned () {
    if (get('mode') === 'zen') {
      get('db.mems').load('learned', function (err, learned) {
        if (err) throw err
        if (learned) {
          Object.keys(learned.best_params).forEach(function (k) {
            bot[k] = learned.best_params[k]
          })
        }
      })
    }
  }
  syncLearned()
  function syncBalance (cb) {
    if (!bot.trade) return cb && cb()
    bot.trade = false
    client.getAccounts(function (err, resp, accounts) {
      if (err) throw err
      if (resp.statusCode !== 200) {
        console.error(accounts)
        throw new Error('non-200 status from exchange: ' + resp.statusCode)
      }
      accounts.forEach(function (account) {
        if (account.currency === constants.currency) {
          rs.currency = n(account.balance).value()
        }
        else if (account.currency === constants.asset) {
          rs.asset = n(account.balance).value()
        }
      })
      bot.trade = true
      cb && cb()
    })
  }

  function getGraph () {
    var thisTotal = n(rs.high)
      .add(rs.low)
      .add(rs.last_tick.close)
      .divide(3)
      .multiply(rs.period_vol)
      .value()
    rs.running_total = n(rs.running_total)
      .add(thisTotal)
      .value()
    rs.running_vol = n(rs.running_vol)
      .add(rs.period_vol)
      .value()
    var vwap = n(rs.running_total)
      .divide(rs.running_vol)
      .value()
    var vwap_diff = n(rs.last_tick.close)
      .subtract(vwap)
      .value()
    rs.max_diff = Math.max(rs.max_diff, Math.abs(vwap_diff))
    var half = constants.bar_width / 2
    var bar = ''
    if (vwap_diff > 0) {
      bar += ' '.repeat(half)
      var stars = Math.min(Math.round((vwap_diff / rs.max_diff) * half), half)
      bar += '+'.repeat(stars).green.bgGreen
      bar += ' '.repeat(half - stars)
    }
    else if (vwap_diff < 0) {
      var stars = Math.min(Math.round((Math.abs(vwap_diff) / rs.max_diff) * half), half)
      bar += ' '.repeat(half - stars)
      bar += '-'.repeat(stars).red.bgRed
      bar += ' '.repeat(half)
    }
    else {
      bar += ' '.repeat(half * 2)
    }
    rs.high = 0
    rs.low = 10000
    return bar
  }

  function write (tick) {
    if (!rs.first_tick) {
      rs.first_tick = tick
    }
    rs.period_vol = n(rs.period_vol)
      .add(tick.vol)
      .value()
    rs.hour_vol = n(rs.hour_vol)
      .add(tick.vol)
      .value()
    rs.high = Math.max(rs.high, tick.high)
    rs.low = Math.min(rs.low, tick.low)

    if (rs.side && tick.side !== rs.side) {
      rs.vol = n(rs.vol)
        .subtract(tick.vol)
        .value()
      if (rs.vol < 0) rs.side = tick.side
      rs.vol = Math.abs(rs.vol)
    }
    else {
      rs.side = tick.side
      rs.vol = n(rs.vol)
        .add(tick.vol)
        .value()
    }
    var vol_string = zerofill(3, Math.round(rs.vol), ' ').white
    rs.vol_diff_string = vol_string + ' ' + (rs.side === 'BUY' ? 'BULL'.green : 'BEAR'.red)
    if (rs.vol >= bot.min_vol) {
      // trigger
      if (rs.cooldown >= 1) rs.cooldown--
      else rs.cooldown = 0
      if (rs.vol >= bot.vol_reset) {
        rs.vol = 0
      }
      if (rs.side === 'BUY' && rs.currency <= 0) {
        return finish()
      }
      else if (rs.side === 'SELL' && rs.asset <= 0) {
        return finish()
      }
      else if (rs.side === 'BUY') {
        if (rs.cooldown > 0) {
          return finish()
        }
        var delta = n(1)
          .subtract(n(tick.close).divide((rs.last_tick ||  tick).close))
          .value()
        var price = n(tick.close)
          .add(n(tick.close).multiply(constants.markup))
          .value() // add markup
        var vwap = n(rs.running_total)
          .divide(rs.running_vol)
          .value()
        var vwap_diff = n(price)
          .subtract(vwap)
          .value()
        var spend
        if (vwap_diff > 0) {
          // buy more when price is rising
          spend = n(rs.currency)
            .multiply(bot.trade_amt)
            .value()
        }
        else {
          // buy less when price is falling
          spend = n(rs.currency)
            .multiply(n(1).subtract(bot.trade_amt))
            .value()
        }
        if (spend / price < bot.min_trade) {
          return finish()
        }
        if (rs.sell_price && price > rs.sell_price) {
          var sell_delta = n(1)
            .subtract(n(rs.sell_price).divide(price))
            .value()
          if (sell_delta >= bot.buy_for_more) {
            return finish()
          }
        }
        if (delta >= bot.crash) {
          rs.cooldown = 0
          return finish()
        }
        get('console').info(('[bot] volume trigger ' + rs.side + ' ' + n(rs.vol).format('0.0') + ' >= ' + n(bot.min_vol).format('0.0')).grey)
        rs.cooldown = Math.round(bot.cooldown)
        rs.vol = 0
        rs.buy_price = price
        rs.currency = n(rs.currency)
          .subtract(spend)
          .value()
        var size = n(spend)
          .divide(price)
          .value()
        rs.trade_vol = n(rs.trade_vol)
          .add(size)
          .value()
        rs.num_trades++
        rs.asset = n(rs.asset)
          .add(size)
          .value()
        var fee = n(size)
          .multiply(price)
          .multiply(constants.fee)
          .value()
        rs.currency = n(rs.currency)
          .subtract(fee)
          .value()
        get('console').info(('[bot] BUY ' + n(size).format('0.000') + ' ' + constants.asset + ' at ' + n(price).format('$0,0.00') + ' ' + n(delta).format('0.000%')).cyan)
        if (bot.trade && !bot.sim) {
          var buy_params = {
            type: 'market',
            size: n(size).format('00.000'),
            product_id: constants.product_id
          }
          client.buy(buy_params, function (err, resp, order) {
            onOrder(err, resp, order)
            if (bot.tweet) {
              var tweet = {
                status: 'zenbot recommends:\n\naction: BUY\nprice: ' + n(price).format('$0,0.00') + '\ntime: ' + get_time() + '\n\n' + constants.hashtags
              }
              twitterClient.post('statuses/update', tweet, onTweet)
            }
            syncBalance()
          })
        }
      }
      else if (rs.side === 'SELL') {
        if (rs.cooldown > 0) {
          get('console').info(('[bot] too soon to SELL').grey)
          return finish()
        }
        var price = n(tick.close)
          .subtract(n(tick.close).multiply(constants.markup))
          .value()
        var delta = n(1)
          .subtract(n(rs.last_tick.close).divide(tick.close))
          .value()
        var vwap = n(rs.running_total)
          .divide(rs.running_vol)
          .value()
        var vwap_diff = n(price)
          .subtract(vwap)
          .value()
        var sell
        if (vwap_diff < 0) {
          // sell more when price is falling
          sell = n(rs.asset)
            .multiply(bot.trade_amt)
            .value()
        }
        else {
          // sell less when price is rising
          sell = n(rs.asset)
            .multiply(n(1).subtract(bot.trade_amt))
            .divide(2)
            .value()
        }
        if (sell < bot.min_trade) {
          return finish()
        }
        if (rs.buy_price && price < rs.buy_price) {
          var buy_delta = n(1).subtract(n(price).divide(rs.buy_price)).value()
          if (buy_delta >= bot.sell_for_less) {
            return finish()
          }
        }
        if (delta >= bot.crash) {
          rs.cooldown = 0
          return finish()
        }
        get('console').info(('[bot] volume trigger ' + rs.side + ' ' + n(rs.vol).format('0.0') + ' >= ' + n(bot.min_vol).format('0.0')).grey)
        rs.cooldown = Math.round(bot.cooldown)
        rs.vol = 0
        rs.sell_price = price
        rs.asset = n(rs.asset)
          .subtract(sell)
          .value()
        rs.trade_vol = n(rs.trade_vol)
          .add(sell)
          .value()
        rs.num_trades++
        rs.currency = n(rs.currency)
          .add(n(sell).multiply(price))
          .value()
        var fee = n(sell)
          .multiply(price)
          .multiply(constants.fee)
          .value()
        rs.currency = n(rs.currency)
          .subtract(fee)
          .value()
        get('console').info(('[bot] SELL ' + n(sell).format('00.000') + ' ' + constants.asset + ' at ' + n(price).format('$0,0.00') + ' ' + n(delta).format('0.000%')).cyan)
        if (bot.trade && !bot.sim) {
          var sell_params = {
            type: 'market',
            size: n(sell).format('00.000'),
            product_id: constants.product_id
          }
          client.sell(sell_params, function (err, resp, order) {
            onOrder(err, resp, order)
            if (bot.tweet) {
              var tweet = {
                status: 'zenbot recommends:\n\naction: SELL\nprice: ' + n(price).format('$0,0.00') + '\ntime: ' + get_time() + '\n\n' + constants.hashtags
              }
              twitterClient.post('statuses/update', tweet, onTweet)
            }
            syncBalance()
          })
        }
      }
      function onOrder (err, resp, order) {
        if (err) return get('console').error('order err', err, resp, order)
        if (resp.statusCode !== 200) {
          console.error(order)
          return get('console').error('non-200 status from exchange: ' + resp.statusCode)
        }
        get('console').log(('[exchange] order-id: ' + order.id).cyan)
        function getStatus () {
          client.getOrder(order.id, function (err, resp, order) {
            if (err) return get('console').error('getOrder err', err)
            if (resp.statusCode !== 200) {
              console.error(order)
              return get('console').error('non-200 status from exchange getOrder: ' + resp.statusCode)
            }
            if (order.status === 'done') {
              return get('console').info(('[exchange] order ' + order.id + ' done: ' + order.done_reason).cyan)
            }
            else {
              get('console').info(('[exchange] order ' + order.id + ' ' + order.status).cyan)
              setTimeout(getStatus, 5000)
            }
          })
        }
        getStatus()
      }
    }
    finish()
    function finish () {
      rs.last_tick = tick
      gleak.print()
    }
  }
  function report () {
    var timestamp = get('utils.get_timestamp')(rs.last_tick.time)
    var bar = getGraph()
    var diff = n(rs.currency)
      .add(n(rs.asset).multiply(rs.last_tick.close))
      .subtract(start_balance)
      .value()
    if (diff > 0) diff = ('+' + n(diff).format('$0,0.00')).green
    if (diff === 0) diff = ('+' + n(diff).format('$0,0.00')).white
    if (diff < 0) diff = (n(diff).format('$0,0.00')).red
    var status = [
      bar,
      n(rs.last_tick.close).format('$0,0.00').yellow,
      rs.vol_diff_string,
      timestamp.grey,
      n(rs.asset).format('00.000').white,
      constants.product_id.grey,
      n(rs.currency).format('$,0.00').yellow,
      diff,
      n(rs.trade_vol).format('0.000').white
    ].join(' ')
    get('console').log(status)
    var this_hour = tb(rs.last_tick.time).resize('1h').toString()
    var saved_hour_vol = rs.hour_vol
    if (this_hour !== rs.last_hour) {
      rs.hour_vol = 0
      if (bot.tweet) {
        client.getProduct24HrStats(function (err, resp, stats) {
          if (err) return get('console').error('get stats err', err)
          if (resp.statusCode !== 200) {
            console.error(stats)
            return get('console').error('non-200 from exchange stats: ' + resp.statusCode)
          }
          var diff = n(rs.last_tick.close)
            .subtract(stats.open)
            .value()
          var diff_str = diff >= 0 ? '+' : '-'
          diff_str += n(Math.abs(diff)).format('$0.00')
          var vwap = n(rs.running_total)
            .divide(rs.running_vol)
            .value()
          var vwap_diff = n(rs.last_tick.close)
            .subtract(vwap)
            .value()
          var vwap_diff_str = vwap_diff >= 0 ? '+' : '-'
          vwap_diff_str += n(Math.abs(vwap_diff)).format('$0.00')
          var text = [
            get_time() + ' report.\n',
            'close: ' + n(rs.last_tick.close).format('$0,0.00'),
            'vs. vwap: ' + vwap_diff_str,
            'hr. volume: ' + n(Math.round(saved_hour_vol)).format('0,0'),
            'market: ' + (rs.side === 'BUY' ? 'BULL' : 'BEAR'),
            '24hr. diff: ' + diff_str + '\n',
            constants.hashtags
          ].join('\n').trim()
          var tweet = {
            status: text
          }
          twitter_client.post('statuses/update', tweet, onTweet)
          gleak.print()
        })
      }
    }
    rs.last_hour = this_hour
    rs.period_vol = 0
    if (bot.trade) {
      get('db.mems').save(rs, function (err, saved) {
        if (err) throw err
      })
      syncBalance()
    }
    else if (bot.sim) {
      syncBalance()
    }
    syncLearned()
    gleak.print()
  }
  function end () {
    var new_balance = start_balance
    if (rs.last_tick) {
      new_balance = n(rs.currency)
        .add(
          n(rs.asset)
            .multiply(rs.last_tick.close)
        )
        .value()
    }
    gleak.print()
    return {
      balance: new_balance,
      trade_vol: rs.trade_vol,
      num_trades: rs.num_trades
    }
  }
  return {
    write: write,
    report: report,
    end: end,
    run_state: rs
  }
}
