var n = require('numbro')
  , colors = require('colors')
  , tb = require('timebucket')
  , zerofill = require('zero-fill')
  , moment = require('moment')
  , c = require('../conf/constants.json')
  , request = require('micro-request')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var get_time = get('utils.get_time')
  var bot = get('bot')
  var start_balance = get('mode') === 'simulator' ? c.sim_start_balance : 0
  var rs = {
    id: c.product_id,
    asset: 0,
    currency: start_balance,
    start_balance: start_balance,
    side: null,
    period_vol: 0,
    period_trades: 0,
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
    num_trades: 0,
    volatility: 0,
    max_vol: 0,
    last_learned: null,
    net_worth: null,
    avg_price: null,
    exchanges: {}
  }
  if (bot.tweet) {
    var twitter_client = get('utils.twitter_client')
    function onTweet (err, data, response) {
      if (err) return get('console').error('tweet err', err, {data: {err: err}})
      if (response.statusCode === 200 && data && data.id_str) {
        get('console').info('tweeted: '.cyan + data.text.white, {public: false, data: {tweet: data}})
        get('console').info('tweeted: '.cyan + data.text.white, {public: true, data: {tweet: data}})
      }
      else get('console').error('tweet err', response.statusCode, {data: {statusCode: response.statusCode, body: data}})
    }
  }
  if (bot.sim) {
    bot.trade = true
  }
  if (get('mode') === 'zen') {
    get('motley:db.mems').load(rs.id, function (err, mem) {
      if (err) throw err
      if (mem) {
        Object.keys(mem).forEach(function (k) {
          if (k.match(/^(asset|currency)$/)) return
          rs[k] = mem[k]
        })
        get('console').info('memory loaded.'.white + ' resuming trading!'.cyan, {data: {mem: mem}})
        start()
      }
      else {
        get('console').info('no memory found.'.red + ' starting trading!'.cyan, {data: {mem: null}})
        start()
      }
    })
  }
  else {
    get('console').info(('mode = ' + get('mode')).red + ' starting!'.cyan, {data: {mem: null}})
    start()
  }

  function start () {
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
            return get('console').error('non-200 status from exchange: ' + resp.statusCode, {data: {body: ticker, statusCode: resp.statusCode}})
          }
          if (!rs.start_balance) {
            rs.start_balance = n(rs.asset)
              .multiply(ticker.price)
              .add(rs.currency)
              .value()
            rs.start_time = new Date().getTime()
          }
          rs.max_vol = 0
          get('console').info(('[exchange] bid = ' + ticker.bid + ', ask = ' + ticker.ask).cyan, {data: {ticker: ticker}})
          bot.trade = true
        })
      })
    }
  }
  function syncLearned () {
    if (get('mode') === 'zen') {
      get('motley:db.mems').load('learned', function (err, learned) {
        if (err) throw err
        if (learned) {
          if (rs.last_learned && learned.best_fitness > rs.last_learned.best_fitness) {
            get('console').info(('[zen] i have improved the strategy!').yellow)
            get('console').info(('[zen] new roi = ' + n(learned.roi).format('0.000') + ' (' + learned.learner + ')').yellow, {data: {learned: learned, last_learned: rs.last_learned}})
          }
          else if (!rs.last_learned) {
            get('console').info(('[zen] roi = ' + n(learned.roi).format('0.000') + ' (' + learned.learner + ')').yellow, {data: {learned: learned}})
          }
          Object.keys(learned.best_params).forEach(function (k) {
            bot[k] = learned.best_params[k]
            if (!rs.last_learned || rs.last_learned.best_params[k] !== learned.best_params[k]) {
              if (rs.last_learned) {
                get('console').info(('[old] ' + k + ' = ' + rs.last_learned.best_params[k]).grey)
              }
              get('console').info(('[learned] ' + k + ' = ' + learned.best_params[k]).yellow)
            }
          })
          rs.last_learned = learned
        }
      })
    }
  }
  function syncVolatility () {
    if (get('mode') === 'zen') {
      request('https://btcvol.info/latest', {headers: {'User-Agent': ZENBOT_USER_AGENT}}, function (err, resp, body) {
        if (err) throw err
        if (resp.statusCode !== 200) {
          console.error(body)
          get('console').error('non-200 from btcvol: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: body}})
          return
        }
        body = JSON.parse(body)
        if (rs.volatility !== body.Volatility) {
          get('console').info(('[btcvol.info] volatility ' + (rs.volatility ? n(rs.volatility).divide(100).format('0.000%') + ' -> ' : '') + n(body.Volatility).divide(100).format('0.000%')).cyan, {data: {volatility: body.Volatility}})
        }
        rs.volatility = body.Volatility
      })
    }
  }
  syncLearned()
  syncVolatility()
  function syncBalance (cb) {
    if (!bot.trade) return cb && cb()
    bot.trade = false
    client.getAccounts(function (err, resp, accounts) {
      if (err) throw err
      if (resp.statusCode !== 200) {
        console.error(accounts)
        get('console').error('non-200 status from exchange: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: accounts}})
        return cb && cb()
      }
      accounts.forEach(function (account) {
        if (account.currency === c.currency) {
          rs.currency = n(account.balance).value()
        }
        else if (account.currency === c.asset) {
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
      .add(rs.avg_price)
      .divide(3)
      .multiply(rs.period_vol)
      .value()
    rs.running_total = n(rs.running_total)
      .add(n(thisTotal).multiply(c.running_vol_decay))
      .value()
    rs.running_vol = n(rs.running_vol)
      .add(n(rs.period_vol).multiply(c.running_vol_decay))
      .value()
    rs.vwap = n(rs.running_total)
      .divide(rs.running_vol)
      .value()
    rs.vwap_diff = n(rs.avg_price)
      .subtract(rs.vwap)
      .value()
    rs.max_diff = Math.max(rs.max_diff, Math.abs(rs.vwap_diff))
    var half = c.bar_width / 2
    var bar = ''
    if (rs.vwap_diff > 0) {
      bar += ' '.repeat(half)
      var stars = Math.min(Math.round((rs.vwap_diff / (rs.max_diff * c.graph_expand)) * half), half)
      bar += '+'.repeat(stars).green.bgGreen
      bar += ' '.repeat(half - stars)
    }
    else if (rs.vwap_diff < 0) {
      var stars = Math.min(Math.round((Math.abs(rs.vwap_diff) / (rs.max_diff * c.graph_expand)) * half), half)
      bar += ' '.repeat(half - stars)
      bar += '-'.repeat(stars).red.bgRed
      bar += ' '.repeat(half)
    }
    else {
      bar += ' '.repeat(half * 2)
    }
    rs.net_worth = n(rs.currency)
      .add(n(rs.asset).multiply(rs.avg_price))
      .value()
    rs.diff = n(rs.net_worth).subtract(rs.start_balance)
      .value()
    if (rs.diff > 0) rs.diff_ansi = zerofill(9, '+' + n(rs.diff).format('$0.00'), ' ').green
    if (rs.diff === 0) rs.diff_ansi = zerofill(9, n(rs.diff).format('$0.00'), ' ').white
    if (rs.diff < 0) rs.diff_ansi = (zerofill(9, n(rs.diff).format('$0.00'), ' ')).red
    rs.zmi = colors.strip(rs.vol_diff_string).trim()
    rs.vwap_diff_str = rs.max_diff ? n(rs.vwap_diff).divide(rs.max_diff).format('0%') : '0%'
    if (rs.vwap_diff >= 0) {
      rs.vwap_diff_ansi_str = (zerofill(6, '+' + rs.vwap_diff_str, ' ')).green
    }
    else {
      rs.vwap_diff_ansi_str = (zerofill(6, rs.vwap_diff_str, ' ')).red
    }
    rs.high = 0
    rs.low = 100000
    rs.bar = bar
  }

  function write (tick) {
    if (!rs.first_tick && tick.avg_price) {
      rs.first_tick = tick
    }
    rs.period_trades = n(rs.period_trades)
      .add(tick.trades)
      .value()
    rs.max_diff = Math.max(0, n(rs.max_diff)
      .multiply(c.graph_decay)
      .value())
    rs.period_vol = n(rs.period_vol)
      .add(tick.vol)
      .value()
    rs.hour_vol = n(rs.hour_vol)
      .add(tick.vol)
      .value()
    rs.high = Math.max(rs.high, tick.high)
    rs.low = Math.min(rs.low, tick.low)
    rs.vol = n(rs.vol)
      .multiply(bot.vol_decay)
      .value()
    if (rs.side && tick.side !== rs.side) {
      rs.vol = n(rs.vol)
        .subtract(n(tick.vol).multiply(tick.side === 'BUY' ? bot.buy_factor : bot.sell_factor))
        .value()
      if (rs.vol < 0) rs.side = tick.side
      rs.vol = Math.abs(rs.vol)
    }
    else {
      rs.side = tick.side
      rs.vol = n(rs.vol)
        .add(n(tick.vol).multiply(tick.side === 'BUY' ? bot.buy_factor : bot.sell_factor))
        .value()
    }
    if (Math.floor(rs.vol) > Math.ceil(rs.max_vol)) {
      rs.new_max_vol = true
      rs.max_vol = rs.vol
    }
    else {
      rs.new_max_vol = false
    }
    var vol_string = zerofill(6, Math.floor(rs.vol), ' ')[rs.new_max_vol ? 'cyan' : 'white']
    rs.vol_diff_string = vol_string + ('/' + Math.ceil(bot.min_vol)).grey + ' ' + (rs.side === 'BUY' ? 'BULL'.green : 'BEAR'.red)
    if (rs.vol >= bot.min_vol) {
      var trigger_vol = rs.vol
      rs.vol = 0
      rs.max_vol = 0
      // trigger
      if (rs.cooldown >= 1) rs.cooldown--
      else rs.cooldown = 0
      if (rs.side === 'BUY' && rs.currency <= 0) {
        return finish()
      }
      else if (rs.side === 'SELL' && rs.asset <= 0) {
        return finish()
      }
      else if (rs.side === 'BUY') {
        if (rs.cooldown > 0 || !rs.avg_price) {
          return finish()
        }
        var price = n(rs.avg_price)
          .add(n(rs.avg_price).multiply(c.markup))
          .value() // add markup
        var spend = n(rs.currency)
            .multiply(bot.trade_amt)
            .value()
        var fee = n(size)
          .multiply(price)
          .multiply(c.fee)
          .value()
        var size = n(spend)
          .divide(price)
          .value()
        get('console').info(('[bot] volume trigger ' + rs.side + ' ' + n(trigger_vol).format('0.0') + ' >= ' + n(bot.min_vol).format('0.0')).cyan, {data: {action: rs.side, trigger_vol: trigger_vol, min_vol: bot.min_vol}})
        if (bot.tweet) {
          setImmediate(function () {
            var tweet = {
              status: [
                'zenbot advises: BUY ' + c.asset,
                'price: ' + n(price).format('$0,0.00'),
                'time: ' + get_time(),
                c.base_url + '/#t__' + (new Date().getTime() + 30000) + ' ' + c.hashtags
              ].join('\n')
            }
            twitter_client.post('statuses/update', tweet, onTweet)
          })
        }
        if (spend / price < c.min_trade_possible) {
          // would buy, but not enough funds
          get('console').info(('[bot] not enough currency to buy!').red, {data: {actionspend: spend, price: price, size: spend / price, min_trade: c.min_trade_possible, currency: rs.currency}})
          //rs.vol = 0
          return finish()
        }
        // rs.vol = 0
        // rs.max_vol = 0
        rs.buy_price = price
        rs.trade_vol = n(rs.trade_vol)
          .add(size)
          .value()
        rs.num_trades++
        rs.asset = n(rs.asset)
          .add(size)
          .value()
        rs.currency = n(rs.currency)
          .subtract(spend)
          .subtract(fee)
          .value()
        get('console').info(('[bot] BUY ' + n(size).format('0.000') + ' ' + c.asset + ' at ' + n(price).format('$0,0.00').cyan), {data: {action: 'BUY', size: size, asset: rs.asset, currency: rs.currency, price: price, fee: fee, num_trades: rs.num_trades, trade_vol: rs.trade_vol}})
        assert(rs.currency >= 0)
        assert(rs.asset >= 0)
        if (bot.trade && !bot.sim) {
          var buy_params = {
            type: 'market',
            size: n(size).format('0.000'),
            product_id: c.product_id
          }
          client.buy(buy_params, function (err, resp, order) {
            onOrder(err, resp, order)
            syncBalance()
          })
        }
      }
      else if (rs.side === 'SELL') {
        if (!rs.avg_price) {
          return finish()
        }
        var price = n(rs.avg_price)
          .subtract(n(rs.avg_price).multiply(c.markup))
          .value()
        var sell = n(rs.asset)
          .multiply(bot.trade_amt)
          .value()
        var fee = n(sell)
          .multiply(price)
          .multiply(c.fee)
          .value()
        get('console').info(('[bot] volume trigger ' + rs.side + ' ' + n(trigger_vol).format('0.0') + ' >= ' + n(bot.min_vol).format('0.0')).yellow, {data: {action: rs.side, trigger_vol: trigger_vol, min_vol: bot.min_vol}})
        if (bot.tweet) {
          setImmediate(function () {
            var tweet = {
              status: 'zenbot recommends:\n\naction: SELL\nprice: ' + n(price).format('$0,0.00') + '\ntime: ' + get_time() + '\n\n' + c.hashtags
            }
            twitter_client.post('statuses/update', tweet, onTweet)
          })
        }
        if (sell < c.min_trade_possible) {
          // would buy, but not enough funds
          get('console').info(('[bot] not enough asset to sell!').red, {data: {size: sell, price: price, min_trade: c.min_trade_possible}})
          //rs.vol = 0
          return finish()
        }
        // rs.vol = 0
        // rs.max_vol = 0
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
          .subtract(fee)
          .value()
        get('console').info(('[bot] SELL ' + n(sell).format('0.000') + ' ' + c.asset + ' at ' + n(price).format('$0,0.00')).yellow, {data: {size: sell, price: price}})
        assert(rs.currency >= 0)
        assert(rs.asset >= 0)
        if (bot.trade && !bot.sim) {
          var sell_params = {
            type: 'market',
            size: n(sell).format('0.000'),
            product_id: c.product_id
          }
          client.sell(sell_params, function (err, resp, order) {
            onOrder(err, resp, order)
            syncBalance()
          })
        }
      }
      function onOrder (err, resp, order) {
        if (err) return get('console').error('order err', err, resp, order)
        if (resp.statusCode !== 200) {
          console.error(order)
          return get('console').error('non-200 status from exchange: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
        }
        get('console').log(('[exchange] order-id: ' + order.id).cyan, {data: {order: order}})
        function getStatus () {
          client.getOrder(order.id, function (err, resp, order) {
            if (err) return get('console').error('getOrder err', err)
            if (resp.statusCode !== 200) {
              console.error(order)
              return get('console').error('non-200 status from exchange getOrder: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: order}})
            }
            if (order.status === 'done') {
              return get('console').info(('[exchange] order ' + order.id + ' done: ' + order.done_reason).cyan, {data: {order: order}})
            }
            else {
              get('console').info(('[exchange] order ' + order.id + ' ' + order.status).cyan, {data: {order: order}})
              setTimeout(getStatus, 5000)
            }
          })
        }
        getStatus()
      }
    }
    finish()
    function finish () {
      if (!tick.avg_price) return
      rs.last_tick = tick
      Object.keys(tick.exchanges).forEach(function (exchange) {
        rs.exchanges[exchange] = tick.exchanges[exchange]
      })
      var prices = []
      Object.keys(rs.exchanges).forEach(function (exchange) {
        var x = rs.exchanges[exchange]
        if (x.typical) {
          prices.push(x.typical)
        }
      })
      var total = prices.reduce(function (prev, curr) {
        return n(prev).add(curr).value()
      }, 0)
      rs.avg_price = n(total).divide(prices.length).value()
    }
  }
  var first_report = true
  function report () {
    if (!rs.avg_price) return
    rs.uptick = !rs.last_avg_price || rs.last_avg_price < rs.avg_price
    if (rs.last_avg_price === rs.avg_price) {
      rs.uptick = 0
      rs.arrow = '↘'.grey
    }
    else {
      rs.arrow = rs.uptick ? '↗'.green : '↘'.red
    }
    rs.last_avg_price = rs.avg_price
    var is_sim = get('mode') === 'simulator'
    if (first_report) {
      var ts = is_sim ? '             SIM DATE      ' : ''
      console.error(('DATE                       PAIR    HEALTH                        PRICE     TXNS  VOL      ZMI' + ts + '             ' + c.asset + '      ' + c.currency + '        BALANCE    DIFF       TRADED').white)
      first_report = false
    }
    var timestamp = get('utils.get_timestamp')(rs.last_tick.time)
    getGraph()
    var status = [
      c.product_id.grey,
      rs.vwap_diff_ansi_str,
      rs.bar,
      rs.arrow + zerofill(9, n(rs.avg_price).format('$0.00'), ' ')[rs.uptick === 0 ? 'grey' : rs.uptick ? 'green' : 'red'],
      zerofill(5, rs.period_trades, ' ').grey,
      zerofill(7, n(rs.period_vol).format('0.000'), ' ').white,
      rs.vol_diff_string,
      is_sim ? timestamp.grey : false,
      zerofill(7, n(rs.asset).format('0.000'), ' ').white,
      zerofill(9, n(rs.currency).format('$0.00'), ' ').yellow,
      zerofill(9, n(rs.net_worth).format('$0.00'), ' ').cyan,
      rs.diff_ansi,
      zerofill(7, n(rs.trade_vol).format('0.000'), ' ').white
    ].filter(function (col) { return col === false ? false : true }).join(' ')
    get('console').log(status, {data: {rs: rs, zmi: rs.zmi, new_max_vol: rs.new_max_vol, side: rs.side, price: rs.avg_price}})
    var status_public = [
      c.product_id.grey,
      rs.bar,
      rs.arrow + zerofill(8, n(rs.avg_price).format('$0.00'), ' ')[rs.uptick === 0 ? 'grey' : rs.uptick ? 'green' : 'red'],
      zerofill(5, rs.period_trades, ' ').grey,
      zerofill(7, n(rs.period_vol).format('0.000'), ' ').white,
      rs.vol_diff_string
    ].join(' ')
    get('console').log(status_public, {public: true, data: {zmi: rs.zmi, new_max_vol: rs.new_max_vol, side: rs.side, price: rs.avg_price}})
    var this_hour = tb(rs.last_tick.time).resize('1h').toString()
    var saved_hour_vol = rs.hour_vol
    if (this_hour !== rs.last_hour) {
      rs.hour_vol = 0
      if (bot.tweet) {
        client.getProduct24HrStats(function (err, resp, stats) {
          if (err) return get('console').error('get stats err', err)
          if (resp.statusCode !== 200) {
            console.error(stats)
            return get('console').error('non-200 from exchange stats: ' + resp.statusCode, {data: {statusCode: resp.statusCode, body: stats}})
          }
          var diff = n(rs.avg_price)
            .subtract(stats.open)
            .divide(rs.avg_price)
            .value()
          var diff_str = diff >= 0 ? '+' : '-'
          diff_str += n(Math.abs(diff)).format('0.000%')
          var text = [
            get_time() + ' report:',
            'zmi: ' + colors.strip(rs.vol_diff_string).replace(/ +/g, ' ').trim(),
            'price: ' + rs.avg_price,
            'vol: ' + n(saved_hour_vol).format('0,0') + ' ' + c.asset,
            '24hr trend: ' + diff_str,
            c.base_url + '/#t__' + (new Date().getTime() + 30000) + ' ' + c.hashtags
          ].join('\n').trim()
          var tweet = {
            status: text
          }
          twitter_client.post('statuses/update', tweet, onTweet)
        })
      }
      syncVolatility()
    }
    rs.last_hour = this_hour
    rs.period_vol = 0
    rs.period_trades = 0
    if (get('mode') === 'zen') {
      get('motley:db.mems').save(rs, function (err, saved) {
        if (err) throw err
      })
      syncBalance()
      syncLearned()
    }
  }
  function end () {
    var new_balance = rs.start_balance
    if (rs.avg_price) {
      new_balance = n(rs.currency)
        .add(
          n(rs.asset)
            .multiply(rs.avg_price)
        )
        .value()
    }
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
