var n = require('numbro')
  , colors = require('colors')
  , tb = require('timebucket')
  , zerofill = require('zero-fill')
  , moment = require('moment')
  , constants = require('../conf/constants.json')
  , request = require('micro-request')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var get_time = get('utils.get_time')
  var bot = get('bot')
  var start_balance = get('mode') === 'simulator' ? constants.sim_start_balance : 0
  var rs = {
    id: constants.product_id,
    asset: 0,
    currency: start_balance,
    start_balance: start_balance,
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
    num_trades: 0,
    volatility: 0,
    max_vol: 0,
    last_learned: null,
    net_worth: null
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
        get('db.mems').load(rs.id, function (err, mem) {
          if (err) throw err
          if (mem) {
            Object.keys(mem).forEach(function (k) {
              if (k.match(/^(asset|currency)$/)) return
              rs[k] = mem[k]
            })
            get('console').info('memory loaded.'.white + ' resuming trading!'.cyan, {data: {mem: mem}})
            finish()
          }
          else {
            get('console').info('no memory found.'.red + ' starting trading!'.cyan, {data: {mem: null}})
            finish()
          }
          function finish () {
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
          get('console').info(('[btcvol.info] volatility ' + n(rs.volatility).format('0.000') + ' -> ' + n(body.Volatility).format('0.000')).cyan, {data: {volatility: body.Volatility}})
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
      .add(rs.last_tick.typical)
      .divide(3)
      .multiply(rs.period_vol)
      .value()
    rs.running_total = n(rs.running_total)
      .add(n(thisTotal).multiply(constants.running_vol_decay))
      .value()
    rs.running_vol = n(rs.running_vol)
      .add(n(rs.period_vol).multiply(constants.running_vol_decay))
      .value()
    rs.vwap = n(rs.running_total)
      .divide(rs.running_vol)
      .value()
    rs.vwap_diff = n(rs.last_tick.typical)
      .subtract(rs.vwap)
      .value()
    rs.max_diff = Math.max(rs.max_diff, Math.abs(rs.vwap_diff))
    var half = constants.bar_width / 2
    var bar = ''
    if (rs.vwap_diff > 0) {
      bar += ' '.repeat(half)
      var stars = Math.min(Math.round((rs.vwap_diff / (rs.max_diff * 1.2)) * half), half)
      bar += '+'.repeat(stars).green.bgGreen
      bar += ' '.repeat(half - stars)
    }
    else if (rs.vwap_diff < 0) {
      var stars = Math.min(Math.round((Math.abs(rs.vwap_diff) / (rs.max_diff * 1.2)) * half), half)
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
    rs.max_diff = Math.max(0, n(rs.max_diff)
      .subtract(n(tick.vol).multiply(constants.max_diff_decay))
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
        if (rs.cooldown > 0) {
          return finish()
        }
        var price = n(tick.typical)
          .add(n(tick.typical).multiply(constants.markup))
          .value() // add markup
        var spend = n(rs.currency)
            .multiply(bot.trade_amt)
            .value()
        var fee = n(size)
          .multiply(price)
          .multiply(constants.fee)
          .value()
        var size = n(spend)
          .divide(price)
          .value()
        get('console').info(('[bot] volume trigger ' + rs.side + ' ' + n(trigger_vol).format('0.0') + ' >= ' + n(bot.min_vol).format('0.0')).cyan, {data: {action: rs.side, trigger_vol: trigger_vol, min_vol: bot.min_vol}})
        if (bot.tweet) {
          setImmediate(function () {
            var tweet = {
              status: [
                'zenbot advises: BUY ' + constants.asset,
                'price: ' + n(price).format('$0,0.00'),
                'time: ' + get_time(),
                constants.base_url + '/#t__' + (new Date().getTime() + 30000) + ' ' + constants.hashtags
              ].join('\n')
            }
            twitter_client.post('statuses/update', tweet, onTweet)
          })
        }
        if (spend / price < constants.min_trade_possible) {
          // would buy, but not enough funds
          get('console').info(('[bot] not enough currency to buy!').red, {data: {actionspend: spend, price: price, size: spend / price, min_trade: constants.min_trade_possible, currency: rs.currency}})
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
        get('console').info(('[bot] BUY ' + n(size).format('0.000') + ' ' + constants.asset + ' at ' + n(price).format('$0,0.00').cyan), {data: {action: 'BUY', size: size, asset: rs.asset, currency: rs.currency, price: price, fee: fee, num_trades: rs.num_trades, trade_vol: rs.trade_vol}})
        assert(rs.currency >= 0)
        assert(rs.asset >= 0)
        if (bot.trade && !bot.sim) {
          var buy_params = {
            type: 'market',
            size: n(size).format('0.000'),
            product_id: constants.product_id
          }
          client.buy(buy_params, function (err, resp, order) {
            onOrder(err, resp, order)
            syncBalance()
          })
        }
      }
      else if (rs.side === 'SELL') {
        var price = n(tick.typical)
          .subtract(n(tick.typical).multiply(constants.markup))
          .value()
        var sell = n(rs.asset)
          .multiply(bot.trade_amt)
          .value()
        var fee = n(sell)
          .multiply(price)
          .multiply(constants.fee)
          .value()
        get('console').info(('[bot] volume trigger ' + rs.side + ' ' + n(trigger_vol).format('0.0') + ' >= ' + n(bot.min_vol).format('0.0')).yellow, {data: {action: rs.side, trigger_vol: trigger_vol, min_vol: bot.min_vol}})
        if (bot.tweet) {
          setImmediate(function () {
            var tweet = {
              status: 'zenbot recommends:\n\naction: SELL\nprice: ' + n(price).format('$0,0.00') + '\ntime: ' + get_time() + '\n\n' + constants.hashtags
            }
            twitter_client.post('statuses/update', tweet, onTweet)
          })
        }
        if (sell < constants.min_trade_possible) {
          // would buy, but not enough funds
          get('console').info(('[bot] not enough asset to sell!').red, {data: {size: sell, price: price, min_trade: constants.min_trade_possible}})
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
        get('console').info(('[bot] SELL ' + n(sell).format('0.000') + ' ' + constants.asset + ' at ' + n(price).format('$0,0.00')).yellow, {data: {size: sell, price: price}})
        assert(rs.currency >= 0)
        assert(rs.asset >= 0)
        if (bot.trade && !bot.sim) {
          var sell_params = {
            type: 'market',
            size: n(sell).format('0.000'),
            product_id: constants.product_id
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
      rs.arrow = rs.last_tick ? (rs.last_tick.typical < tick.typical ? '↗'.green : '↘'.red) : ' '
      rs.uptick = rs.last_tick ? (rs.last_tick.typical < tick.typical ? true : false) : null
      rs.last_tick = tick
    }
  }
  var first_report = true
  function report () {
    if (!rs.last_tick) return
    var is_sim = get('mode') === 'simulator'
    if (first_report) {
      var ts = is_sim ? '             SIM DATE      ' : ''
      console.error(('DATE                       PRODUCT GRAPH                  PRICE     ZMI' + ts + '             ' + constants.asset + '      ' + constants.currency + '        BALANCE    DIFF       TRADED').white)
      first_report = false
    }
    var timestamp = get('utils.get_timestamp')(rs.last_tick.time)
    var bar = getGraph()
    rs.net_worth = n(rs.currency)
      .add(n(rs.asset).multiply(rs.last_tick.typical))
      .value()
    var diff = n(rs.net_worth).subtract(rs.start_balance)
      .value()
    if (diff > 0) diff = zerofill(9, '+' + n(diff).format('$0.00'), ' ').green
    if (diff === 0) diff = zerofill(9, n(diff).format('$0.00'), ' ').white
    if (diff < 0) diff = (zerofill(9, n(diff).format('$0.00'), ' ')).red
    var zmi = colors.strip(rs.vol_diff_string).trim()
    var status = [
      constants.product_id.grey,
      bar,
      rs.arrow + zerofill(9, n(rs.last_tick.typical).format('$0.00'), ' ')[rs.uptick ? 'green' : 'red'],
      rs.vol_diff_string,
      is_sim ? timestamp.grey : false,
      zerofill(7, n(rs.asset).format('0.000'), ' ').white,
      zerofill(9, n(rs.currency).format('$0.00'), ' ').yellow,
      zerofill(9, n(rs.net_worth).format('$0.00'), ' ').cyan,
      diff,
      zerofill(7, n(rs.trade_vol).format('0.000'), ' ').white
    ].filter(function (col) { return col === false ? false : true }).join(' ')
    get('console').log(status, {data: {rs: rs, zmi: zmi, new_max_vol: rs.new_max_vol, side: rs.side, price: rs.last_tick.price}})
    var status_public = [
      constants.product_id.grey,
      bar,
      rs.arrow + zerofill(8, n(rs.last_tick.typical).format('$0.00'), ' ')[rs.uptick ? 'green' : 'red'],
      rs.vol_diff_string
    ].join(' ')
    get('console').log(status_public, {public: true, data: {zmi: zmi, new_max_vol: rs.new_max_vol, side: rs.side, price: rs.last_tick.price}})
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
          var diff = n(rs.last_tick.typical)
            .subtract(stats.open)
            .divide(rs.last_tick.typical)
            .value()
          var diff_str = diff >= 0 ? '+' : '-'
          diff_str += n(Math.abs(diff)).format('0.000%')
          var vwap_diff_str = rs.vwap_diff >= 0 ? '+' : '-'
          vwap_diff_str += n(Math.abs(n(rs.vwap_diff).divide(rs.last_tick.typical).value())).format('0.000%')
          var text = [
            get_time() + ' report:',
            'zmi: ' + colors.strip(rs.vol_diff_string).replace(/ +/g, ' ').trim(),
            'price: ' + rs.last_tick.price,
            'vol: ' + n(saved_hour_vol).format('0,0') + ' ' + constants.asset,
            'trend: ' + vwap_diff_str,
            constants.base_url + '/#t__' + (new Date().getTime() + 30000) + ' ' + constants.hashtags
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
  }
  function end () {
    var new_balance = rs.start_balance
    if (rs.last_tick) {
      new_balance = n(rs.currency)
        .add(
          n(rs.asset)
            .multiply(rs.last_tick.typical)
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
