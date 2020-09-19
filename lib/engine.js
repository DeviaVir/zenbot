let tb = require('timebucket')
  , moment = require('moment')
  , z = require('zero-fill')
  , n = require('numbro')
  // eslint-disable-next-line no-unused-vars
  , colors = require('colors')
  , abbreviate = require('number-abbreviate')
  , readline = require('readline')
  , path = require('path')
  , _ = require('lodash')
  , notify = require('./notify')
  , rsi = require('./rsi')
  , async = require('async')
  , lolex = require('lolex')
  , { formatAsset, formatPercent, formatCurrency } = require('./format')
  , debug = require('./debug')

let clock
let nice_errors = new RegExp(/(slippage protection|loss protection)/)

module.exports = function (s, conf) {
  let eventBus = conf.eventBus
  eventBus.on('trade', queueTrade)
  eventBus.on('trades', onTrades)

  let so = s.options
  if(_.isUndefined(s.exchange)){
    if (so.mode !== 'live') {
      s.exchange = require(path.resolve(__dirname, '../extensions/exchanges/sim/exchange'))(conf, s)
    }
    else {
      s.exchange = require(path.resolve(__dirname, `../extensions/exchanges/${so.selector.exchange_id}/exchange`))(conf)
    }
  }
  else if (so.mode === 'paper') {
    s.exchange = require(path.resolve(__dirname, '../extensions/exchanges/sim/exchange'))(conf, s)
  }
  if (!s.exchange) {
    console.error('cannot trade ' + so.selector.normalized + ': exchange not implemented')
    process.exit(1)
  }
  s.product_id = so.selector.product_id
  s.asset = so.selector.asset
  s.currency = so.selector.currency
  s.asset_capital = 0

  if (typeof so.period_length == 'undefined')
    so.period_length = so.period
  else
    so.period = so.period_length

  let products = s.exchange.getProducts()
  products.forEach(function (product) {
    if (product.asset === s.asset && product.currency === s.currency) {
      s.product = product
    }
  })
  if (!s.product) {
    console.error('error: could not find product "' + s.product_id + '"')
    process.exit(1)
  }
  if (s.exchange.dynamicFees) {
    s.exchange.setFees({asset: s.asset, currency: s.currency})
  }
  if (so.mode === 'sim' || so.mode === 'paper') {
    s.balance = {asset: so.asset_capital, currency: so.currency_capital, deposit: 0}
  }
  else {
    s.balance = {asset: 0, currency: 0, deposit: 0}
  }

  function memDump () {
    if (!debug.on) return
    let s_copy = JSON.parse(JSON.stringify(s))
    delete s_copy.options.mongo
    delete s_copy.lookback
    console.error(s_copy)
  }

  s.ctx = {
    option: function (name, desc, type, def) {
      if (typeof so[name] === 'undefined') {
        so[name] = def
      }
    }
  }

  let asset_col_width = 0
  let deposit_col_width = 0
  let currency_col_width = 0
  s.lookback = []
  s.day_count = 1
  s.my_trades = []
  s.my_prev_trades = []
  s.vol_since_last_blink = 0
  if (so.mode !== 'sim' && conf.output.api.on) {
    s.boot_time = (new Date).getTime()
    s.tz_offset = new Date().getTimezoneOffset()
    s.last_trade_id = 0
    s.trades = []
  }
  if (so.strategy) {
    s.strategy = require(path.resolve(__dirname, `../extensions/strategies/${so.strategy}/strategy`))
    if (s.strategy.getOptions) {
      s.strategy.getOptions.call(s.ctx, s)
    }
    if (s.strategy.orderExecuted) {
      eventBus.on('orderExecuted', function(type) {
        s.strategy.orderExecuted(s, type, executeSignal)
      })
    }
  }

  var notifier = notify(conf)

  function pushMessage(title, message) {
    if (so.mode === 'live' || so.mode === 'paper') {
      notifier.pushMessage(title, message)
    }
  }

  function isFiat() {
    return !s.currency.match(/^BTC|ETH|XMR|USDT$/)
  }

  function initBuffer (trade) {
    let d = tb(trade.time).resize(so.period_length)
    let de = tb(trade.time).resize(so.period_length).add(1)
    s.period = {
      period_id: d.toString(),
      size: so.period_length,
      time: d.toMilliseconds(),
      open: trade.price,
      high: trade.price,
      low: trade.price,
      close: trade.price,
      volume: 0,
      close_time: de.toMilliseconds() - 1
    }
  }

  function nextBuyForQuote(s, quote) {
    if (s.next_buy_price)
      return n(s.next_buy_price).format(s.product.increment, Math.floor)
    else
      return n(quote.bid).subtract(n(quote.bid).multiply(s.options.markdown_buy_pct / 100)).format(s.product.increment, Math.floor)
  }

  function nextSellForQuote(s, quote) {
    if (s.next_sell_price)
      return n(s.next_sell_price).format(s.product.increment, Math.ceil)
    else
      return n(quote.ask).add(n(quote.ask).multiply(s.options.markup_sell_pct / 100)).format(s.product.increment, Math.ceil)
  }

  function updatePeriod(trade) {
    s.period.high = Math.max(trade.price, s.period.high)
    s.period.low = Math.min(trade.price, s.period.low)
    s.period.close = trade.price
    s.period.volume += trade.size
    s.period.latest_trade_time = trade.time
    s.strategy.calculate(s)
    s.vol_since_last_blink += trade.size
    if (s.trades && s.last_trade_id !== trade.trade_id) {
      s.trades.push(trade)
      s.last_trade_id = trade.trade_id
    }
  }

  function executeStop (do_sell_stop) {
    let stop_signal
    if (s.my_trades.length || s.my_prev_trades.length) {
      var last_trade
      if (s.my_trades.length) {
        last_trade = s.my_trades[s.my_trades.length - 1]
      } else {
        last_trade = s.my_prev_trades[s.my_prev_trades.length - 1]
      }
      s.last_trade_worth = last_trade.type === 'buy' ? (s.period.close - last_trade.price) / last_trade.price : (last_trade.price - s.period.close) / last_trade.price
      if (!s.acted_on_stop) {
        if (last_trade.type === 'buy') {
          if (do_sell_stop && s.sell_stop && s.period.close < s.sell_stop) {
            stop_signal = 'sell'
            console.log(('\nsell stop triggered at ' + formatPercent(s.last_trade_worth) + ' trade worth\n').red)
            s.stopTriggered = true
          }
          else if (so.profit_stop_enable_pct && s.last_trade_worth >= (so.profit_stop_enable_pct / 100)) {
            s.profit_stop_high = Math.max(s.profit_stop_high || s.period.close, s.period.close)
            s.profit_stop = s.profit_stop_high - (s.profit_stop_high * (so.profit_stop_pct / 100))
          }
          if (s.profit_stop && s.period.close < s.profit_stop && s.last_trade_worth > 0) {
            stop_signal = 'sell'
            console.log(('\nprofit stop triggered at ' + formatPercent(s.last_trade_worth) + ' trade worth\n').green)
          }
        }
        else {
          if (s.buy_stop && s.period.close > s.buy_stop) {
            stop_signal = 'buy'
            console.log(('\nbuy stop triggered at ' + formatPercent(s.last_trade_worth) + ' trade worth\n').red)
          }
        }
      }
    }
    if (stop_signal) {
      if(so.reverse) {
        s.signal = (stop_signal == 'sell') ? 'buy' : 'sell'
        s.acted_on_stop = true
      } else {
        s.signal = stop_signal
        s.acted_on_stop = true
      }
    }
  }

  function syncBalance (cb) {
    let pre_asset = so.mode === 'sim' ? s.sim_asset : s.balance.asset
    s.exchange.getBalance({currency: s.currency, asset: s.asset}, function (err, balance) {
      if (err) return cb(err)
      let diff_asset = n(pre_asset).subtract(balance.asset)
      s.balance = balance
      getQuote(function (err, quote) {
        if (err) return cb(err)

        let post_currency = n(diff_asset).multiply(quote.ask)
        s.asset_capital = n(s.balance.asset).multiply(quote.ask).value()
        let deposit = so.deposit ? Math.max(0, n(so.deposit).subtract(s.asset_capital)) : s.balance.currency // zero on negative
        s.balance.deposit = n(deposit < s.balance.currency ? deposit : s.balance.currency).value()
        if (!s.start_capital) {
          s.start_price = n(quote.ask).value()
          s.start_capital = n(s.balance.deposit).add(s.asset_capital).value()
          s.real_capital = n(s.balance.currency).add(s.asset_capital).value()
          s.net_currency = s.balance.deposit

          if (so.mode !== 'sim') {
            pushMessage('Balance ' + s.exchange.name.toUpperCase(), 'sync balance ' + s.real_capital + ' ' + s.currency  + '\n')
          }
        } else {
          s.net_currency = n(s.net_currency).add(post_currency).value()
        }

        cb(null, { balance, quote })
      })
    })
  }

  function placeOrder (type, opts, cb) {
    if (!s[type + '_order']) {
      s[type + '_order'] = {
        price: opts.price,
        size: opts.size,
        fee: opts.fee,
        orig_size: opts.size,
        remaining_size: opts.size,
        orig_price: opts.price,
        order_type: opts.is_taker ? 'taker' : so.order_type,
        cancel_after: so.cancel_after || 'day'
      }
    }
    let order = s[type + '_order']
    order.price = opts.price
    order.size = opts.size
    order.fee = opts.fee
    order.remaining_size = opts.size


    if (isNaN(order.size) || isNaN(order.price) || isNaN(order.fee)) {
      // treat as a no-op.
      debug.msg('invalid order for ' + type + ', aborting')
      return cb(null, false)
    }

    order.product_id = s.product_id
    order.post_only = conf.post_only
    debug.msg('placing ' + type + ' order...')
    let order_copy = JSON.parse(JSON.stringify(order))
    s.exchange[type](order_copy, function (err, api_order) {
      if (err) return cb(err)
      s.api_order = api_order
      if (api_order.status === 'rejected') {
        if (api_order.reject_reason === 'post only') {
          // trigger immediate price adjustment and re-order
          debug.msg('post-only ' + type + ' failed, re-ordering')
          return cb(null, null)
        }
        else if (api_order.reject_reason === 'balance') {
          // treat as a no-op.
          debug.msg('not enough balance for ' + type + ', aborting')
          return cb(null, false)
        }
        else if (api_order.reject_reason === 'price') {
          // treat as a no-op.
          debug.msg('invalid price for ' + type + ', aborting')
          return cb(null, false)
        }
        err = new Error('\norder rejected')
        err.order = api_order
        return cb(err)
      }
      debug.msg(type + ' order placed at ' + formatCurrency(order.price, s.currency))
      order.order_id = api_order.id
      if (!order.time) {
        order.orig_time = new Date(api_order.created_at).getTime()
      }
      order.time = new Date(api_order.created_at).getTime()
      order.local_time = now()
      order.status = api_order.status
      //console.log('\ncreated ' + order.status + ' ' + type + ' order: ' + formatAsset(order.size) + ' at ' + formatCurrency(order.price) + ' (total ' + formatCurrency(n(order.price).multiply(order.size)) + ')\n')

      setTimeout(function() { checkOrder(order, type, cb) }, so.order_poll_time)
    })
  }

  function getQuote (cb) {
    s.exchange.getQuote({product_id: s.product_id}, function (err, quote) {
      if (err) return cb(err)
      s.quote = quote
      cb(null, quote)
    })
  }

  function isOrderTooSmall(product, quantity, price) {
    if (product.min_size && Number(quantity) < Number(product.min_size))
      return true
    if (product.min_total && n(quantity).multiply(price).value() < Number(product.min_total))
      return true
    return false
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
  function executeSignal (signal, _cb, size, is_reorder, is_taker, reverseCalled) {
    if(so.reverse && !reverseCalled && !size && !is_reorder) {
      console.log(('\nREVERSE SIGNAL MODE ON!\n').red)
      return executeSignal(signal == 'buy' ? 'sell' : 'buy', _cb, size, is_reorder, is_taker, true)
    }
    let price, expected_fee, buy_pct, sell_pct, trades
    delete s[(signal === 'buy' ? 'sell' : 'buy') + '_order']
    s.last_signal = signal
    if (!is_reorder && s[signal + '_order']) {
      if (is_taker) s[signal + '_order'].order_type = 'taker'
      // order already placed
      _cb && _cb(null, null)
      return
    }
    s.acted_on_trend = true
    let cb = function (err, order) {
      if (!order) {
        if (signal === 'buy') delete s.buy_order
        else delete s.sell_order
      }
      if (_cb)
        _cb(err, order)
      else if (err) {
        if (err.message.match(nice_errors)) {
          console.error((err.message + ': ' + err.desc).red)
        } else {
          memDump()
          console.error('\n')
          console.error(err)
          console.error('\n')
        }
      }
    }
    syncBalance(function (err, { quote }) {
      let reorder_pct, fee, trade_balance, tradeable_balance, expected_fee
      if (err) {
        debug.msg('error getting balance')
        err.desc = 'could not execute ' + signal + ': error fetching quote'
        return cb(err)
      }
      if (is_reorder && s[signal + '_order']) {
        if (signal === 'buy') {
          reorder_pct = n(size).multiply(s.buy_order.price).add(s.buy_order.fee).divide(s.balance.deposit).multiply(100)
        } else {
          reorder_pct = n(size).divide(s.balance.asset).multiply(100)
        }
        debug.msg('price changed, resizing order, ' + reorder_pct + '% remain')
        size = null
      }
      if (s.my_prev_trades.length) {
        trades = _.concat(s.my_prev_trades, s.my_trades)
      } else {
        trades = _.cloneDeep(s.my_trades)
      }
      if (signal === 'buy') {
        price = nextBuyForQuote(s, quote)

        if (is_reorder) {
          buy_pct = reorder_pct
        } else {
          buy_pct = so.buy_pct
        }
        if (so.use_fee_asset) {
          fee = 0
        } else if (so.order_type === 'maker' && (buy_pct + s.exchange.takerFee < 100 || !s.exchange.makerBuy100Workaround)) {
          fee = s.exchange.makerFee
        } else {
          fee = s.exchange.takerFee
        }
        trade_balance = n(s.balance.deposit).divide(100).multiply(buy_pct)
        tradeable_balance = n(s.balance.deposit).divide(100 + fee).multiply(buy_pct)
        expected_fee = n(trade_balance).subtract(tradeable_balance).format('0.00000000', Math.ceil) // round up as the exchange will too
        if (buy_pct + fee < 100) {
          size = n(tradeable_balance).divide(price).format(s.product.asset_increment ? s.product.asset_increment : '0.00000000')
        } else {
          size = n(trade_balance).subtract(expected_fee).divide(price).format(s.product.asset_increment ? s.product.asset_increment : '0.00000000')
        }

        if (isOrderTooSmall(s.product, size, price))
          return cb(null, null)

        if (s.product.max_size && Number(size) > Number(s.product.max_size)) {
          size = s.product.max_size
        }
        debug.msg('preparing buy order over ' + formatAsset(size, s.asset) + ' of ' + formatCurrency(tradeable_balance, s.currency) + ' (' + buy_pct + '%) tradeable balance with a expected fee of ' + formatCurrency(expected_fee, s.currency) + ' (' + fee + '%)')

        if(s.buy_quarentine_time && moment.duration(moment(now()).diff(s.buy_quarentine_time)).asMinutes() < so.quarentine_time){
          console.log(('\nbuy cancel quarentine time: '+moment(s.buy_quarentine_time).format('YYYY-MM-DD HH:mm:ss')).red)
          return cb(null, null)
        }

        let latest_low_sell = _.chain(trades).dropRightWhile(['type','buy']).takeRightWhile(['type','sell']).sortBy(['price']).head().value() // return lowest price
        let buy_loss = latest_low_sell ? (latest_low_sell.price - Number(price)) / latest_low_sell.price * -100 : null
        if (so.max_buy_loss_pct != null && buy_loss > so.max_buy_loss_pct) {
          let err = new Error('\nloss protection')
          err.desc = 'refusing to buy at ' + formatCurrency(price, s.currency) + ', buy loss of ' + formatPercent(buy_loss / 100)
          return cb(err)
        }

        if (s.buy_order && so.max_slippage_pct != null) {
          let slippage = n(price).subtract(s.buy_order.orig_price).divide(s.buy_order.orig_price).multiply(100).value()
          if (so.max_slippage_pct != null && slippage > so.max_slippage_pct) {
            let err = new Error('\nslippage protection')
            err.desc = 'refusing to buy at ' + formatCurrency(price, s.currency) + ', slippage of ' + formatPercent(slippage / 100)
            return cb(err)
          }
        }
        if (n(s.balance.deposit).subtract(s.balance.currency_hold || 0).value() < n(price).multiply(size).value() && s.balance.currency_hold > 0) {
          debug.msg('buy delayed: ' + formatPercent(n(s.balance.currency_hold || 0).divide(s.balance.deposit).value()) + ' of funds (' + formatCurrency(s.balance.currency_hold, s.currency) + ') on hold')
          return setTimeout(function () {
            if (s.last_signal === signal) {
              executeSignal(signal, cb, size, true)
            }
          }, conf.wait_for_settlement)
        }

        if(conf.notifiers && !conf.notifiers.only_completed_trades){
          pushMessage('Buying ' + formatAsset(size, s.asset) + ' on ' + s.exchange.name.toUpperCase(), 'placing buy order at ' + formatCurrency(price, s.currency) + ', ' + formatCurrency(quote.bid - Number(price), s.currency) + ' under best bid\n')
        }
        doOrder()

      }
      else if (signal === 'sell') {
        price = nextSellForQuote(s, quote)

        if (is_reorder) {
          sell_pct = reorder_pct
        } else {
          sell_pct = so.sell_pct
        }
        size = n(s.balance.asset).multiply(sell_pct / 100).format(s.product.asset_increment ? s.product.asset_increment : '0.00000000')

        if (isOrderTooSmall(s.product, size, price))
          return cb(null, null)

        if (s.product.max_size && Number(size) > Number(s.product.max_size)) {
          size = s.product.max_size
        }
        let latest_high_buy = _.chain(trades).dropRightWhile(['type','sell']).takeRightWhile(['type','buy']).sortBy(['price']).reverse().head().value() // return highest price
        let sell_loss = latest_high_buy ? (Number(price) - latest_high_buy.price) / latest_high_buy.price * -100 : null
        if (latest_high_buy && so.sell_cancel_pct != null && Math.abs(sell_loss) < so.sell_cancel_pct) {
          console.log(('\nsell_cancel_pct: refusing to sell at ' + formatCurrency(latest_high_buy.price, s.currency) + '-' + formatCurrency(price, s.currency) + ', sell loss of ' + formatPercent(sell_loss/100) + ' - ' + formatPercent(so.sell_cancel_pct/100)+'\n').red)
          return cb(null, null)
        }
        if (so.max_sell_loss_pct != null && sell_loss > so.max_sell_loss_pct) {
          let err = new Error('\nloss protection')
          err.desc = 'refusing to sell at ' + formatCurrency(price, s.currency) + ', sell loss of ' + formatPercent(sell_loss / 100)
          return cb(err)
        }

        if (s.sell_order && so.max_slippage_pct != null) {
          let slippage = n(s.sell_order.orig_price).subtract(price).divide(price).multiply(100).value()
          if (slippage > so.max_slippage_pct) {
            let err = new Error('\nslippage protection')
            err.desc = 'refusing to sell at ' + formatCurrency(price, s.currency) + ', slippage of ' + formatPercent(slippage / 100)
            return cb(err)
          }
        }

        if (n(s.balance.asset).subtract(s.balance.asset_hold || 0).value() < n(size).value()) {
          debug.msg('sell delayed: ' + formatPercent(n(s.balance.asset_hold || 0).divide(s.balance.asset).value()) + ' of funds (' + formatAsset(s.balance.asset_hold, s.asset) + ') on hold')
          return setTimeout(function () {
            if (s.last_signal === signal) {
              executeSignal(signal, cb, size, true)
            }
          }, conf.wait_for_settlement)
        }

        if(conf.notifiers && !conf.notifiers.only_completed_trades){
          pushMessage('Selling ' + formatAsset(size, s.asset) + ' on ' + s.exchange.name.toUpperCase(), 'placing sell order at ' + formatCurrency(price, s.currency) + ', ' + formatCurrency(Number(price) - quote.bid, s.currency) + ' over best ask\n')
        }
        doOrder()

      }
    })
    function doOrder () {
      placeOrder(signal, {
        size: size,
        price: price,
        fee: expected_fee || null,
        is_taker: is_taker,
        cancel_after: so.cancel_after || 'day'
      }, function (err, order) {
        if (err) {
          err.desc = 'could not execute ' + signal + ': error placing order'
          return cb(err)
        }
        if (!order) {
          if (order === false) {
            // not enough balance, or signal switched.
            debug.msg('not enough balance, or signal switched, cancel ' + signal)
            return cb(null, null)
          }
          if (s.last_signal !== signal) {
            // order timed out but a new signal is taking its place
            debug.msg('signal switched, cancel ' + signal)
            return cb(null, null)
          }
          // order timed out and needs adjusting
          debug.msg(signal + ' order timed out, adjusting price')
          let remaining_size = s[signal + '_order'] ? s[signal + '_order'].remaining_size : size
          if (remaining_size !== size) {
            debug.msg('remaining size: ' + remaining_size)
          }
          return executeSignal(signal, _cb, remaining_size, true)
        }
        cb(null, order)
      })
    }
  }

  // Called after an order has been completed.
  // trade_type is either 'buy' or 'sell'
  function executeOrder (order, trade_type) {
    let order_type = so.order_type || 'maker'   // "maker" or "taker"
    let price = order.price
    let fee = 0


    let percentage_fee = 0
    if (order_type === 'maker' && s.exchange.makerFee)
      percentage_fee = s.exchange.makerFee
    else if (order_type === 'taker' && s.exchange.takerFee)
      percentage_fee = s.exchange.takerFee
    if (trade_type === 'sell')
      fee = n(order.size).multiply(percentage_fee / 100).multiply(price).value()
    else if (trade_type === 'buy')
      fee = n(order.size).multiply(percentage_fee / 100).value()

    s.action = trade_type === 'sell' ? 'sold' : 'bought'

    // Compute profit from the last order price.
    let last_price_type = `last_${trade_type}_price`
    let previous_orders = s.my_prev_trades.filter(trade => trade.type === trade_type)
    if (!s[last_price_type] && previous_orders.length) {
      let last_price = previous_orders[previous_orders.length -1].price
      s[last_price_type] = last_price
    }
    let profit = s[last_price_type] && (s[last_price_type] - price) / s[last_price_type]
    s[last_price_type] = price

    let my_trade = {
      order_id: order.order_id,
      time: order.time,
      execution_time: order.time - order.orig_time,
      slippage: trade_type === 'sell' ?
        n(order.orig_price).subtract(price).divide(price).value() :
        n(price).subtract(order.orig_price).divide(order.orig_price).value(),
      type: trade_type,
      size: order.orig_size,
      fee: fee,
      price: price,
      order_type: order_type,
      profit: profit
    }
    if (trade_type === 'buy')
      my_trade.cancel_after = so.cancel_after || 'day'
    s.my_trades.push(my_trade)

    if (so.stats) {
      let execution_time = moment.duration(my_trade.execution_time).humanize()
      let completion_time = moment(order.time).format('YYYY-MM-DD HH:mm:ss')
      let asset_qty = formatAsset(my_trade.size, s.asset)
      let currency_price = formatCurrency(my_trade.price, s.currency)
      let total_price = formatCurrency(my_trade.size * my_trade.price, s.currency)
      let slippage = n(my_trade.slippage).format('0.0000%')
      let orig_price = formatCurrency(order.orig_price, s.currency)
      let order_complete = `\n${trade_type} order completed at ${completion_time}:\n\n` +
          `${asset_qty} at ${currency_price}\n` +
          `total ${total_price}\n` +
          `${slippage} slippage (orig. price ${orig_price})\n` +
          `execution: ${execution_time}\n`
      console.log((order_complete).cyan)
      pushMessage(`${trade_type} ${s.exchange.name.toUpperCase()}`, order_complete)
    }

    if(trade_type == 'sell' && !isNaN(profit) && profit <= 0) {
      s.buy_quarentine_time = now()
    }

    if (trade_type === 'buy')
      delete s.buy_order
    else
      delete s.sell_order

    delete s.buy_stop
    delete s.sell_stop
    if (trade_type === 'buy' && so.sell_stop_pct) {
      s.sell_stop = n(price).subtract(n(price).multiply(so.sell_stop_pct / 100)).value()
    } else if (trade_type === 'sell' && so.buy_stop_pct) {
      s.buy_stop = n(price).add(n(price).multiply(so.buy_stop_pct / 100)).value()
    }
    delete s.profit_stop
    delete s.profit_stop_high

    eventBus.emit('orderExecuted', trade_type)
  }

  function now () {
    return new Date().getTime()
  }

  function writeReport (is_progress, blink_off) {
    if ((so.mode === 'sim' || so.mode === 'train') && !so.verbose) {
      if(so.silent) return
      is_progress = true
    }
    else if (is_progress && typeof blink_off === 'undefined' && s.vol_since_last_blink) {
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
    readline.clearLine(process.stdout)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(moment(is_progress ? s.period.latest_trade_time : tb(s.period.time).resize(so.period_length).add(1).toMilliseconds()).format('YYYY-MM-DD HH:mm:ss')[is_progress && !blink_off ? 'bgBlue' : 'grey'])
    process.stdout.write('  ' + formatCurrency(s.period.close, s.currency, true, true, true) + ' ' + s.product_id.grey)
    if (s.lookback[0]) {
      let diff = (s.period.close - s.lookback[0].close) / s.lookback[0].close
      process.stdout.write(z(8, formatPercent(diff), ' ')[diff >= 0 ? 'green' : 'red'])
    }
    else {
      process.stdout.write(z(9, '', ' '))
    }
    let volume_display = s.period.volume > 99999 ? abbreviate(s.period.volume, 2) : n(s.period.volume).format('0')
    volume_display = z(8, volume_display, ' ')
    if (volume_display.indexOf('.') === -1) volume_display = ' ' + volume_display
    process.stdout.write(volume_display[is_progress && blink_off ? 'cyan' : 'grey'])
    rsi(s, 'rsi', so.rsi_periods)
    if (typeof s.period.rsi === 'number') {
      let half = 5
      let bar = ''
      let stars = 0
      let rsi = n(s.period.rsi).format('00.00')
      if (s.period.rsi >= 50) {
        stars = Math.min(Math.round(((s.period.rsi - 50) / 50) * half) + 1, half)
        bar += ' '.repeat(half - (rsi < 100 ? 3 : 4))
        bar += rsi.green + ' '
        bar += '+'.repeat(stars).green.bgGreen
        bar += ' '.repeat(half - stars)
      }
      else {
        stars = Math.min(Math.round(((50 - s.period.rsi) / 50) * half) + 1, half)
        bar += ' '.repeat(half - stars)
        bar += '-'.repeat(stars).red.bgRed
        bar += rsi.length > 1 ? ' ' : '  '
        bar += rsi.red
        bar += ' '.repeat(half - 3)
      }
      process.stdout.write(' ' + bar)
    }
    else {
      process.stdout.write(' '.repeat(11))
    }
    if (s.strategy.onReport) {
      let cols = s.strategy.onReport.call(s.ctx, s)
      cols.forEach(function (col) {
        process.stdout.write(col)
      })
    }
    if (s.buy_order) {
      process.stdout.write(z(9, 'buying', ' ').green)
    }
    else if (s.sell_order) {
      process.stdout.write(z(9, 'selling', ' ').red)
    }
    else if (s.action) {
      process.stdout.write(z(9, s.action, ' ')[s.action === 'bought' ? 'green' : 'red'])
    }
    else if (s.signal) {
      process.stdout.write(z(9, s.signal || '', ' ')[s.signal ? s.signal === 'buy' ? 'green' : 'red' : 'grey'])
    }
    else if (s.last_trade_worth && !s.buy_order && !s.sell_order) {
      process.stdout.write(z(8, formatPercent(s.last_trade_worth), ' ')[s.last_trade_worth > 0 ? 'green' : 'red'])
    }
    else {
      process.stdout.write(z(9, '', ' '))
    }
    let orig_capital = s.orig_capital || s.start_capital
    let orig_price = s.orig_price || s.start_price
    if (orig_capital) {
      let asset_col = n(s.balance.asset).format(s.asset === 'BTC' ? '0.00000' : '0.00000000') + ' ' + s.asset
      asset_col_width = Math.max(asset_col.length + 1, asset_col_width)
      process.stdout.write(z(asset_col_width, asset_col, ' ').white)
      let deposit_col = n(s.balance.deposit).format(isFiat() ? '0.00' : '0.00000000') + ' ' + s.currency
      deposit_col_width = Math.max(deposit_col.length + 1, deposit_col_width)
      process.stdout.write(z(deposit_col_width, deposit_col, ' ').yellow)
      if (so.deposit) {
        let currency_col = n(s.balance.currency).format(isFiat() ? '0.00' : '0.00000000') + ' ' + s.currency
        currency_col_width = Math.max(currency_col.length + 1, currency_col_width)
        process.stdout.write(z(currency_col_width, currency_col, ' ').green)
        let circulating = s.balance.currency > 0 ? n(s.balance.deposit).divide(s.balance.currency) : n(0)
        process.stdout.write(z(8, n(circulating).format('0.00%'), ' ').grey)
      }
      let consolidated = n(s.net_currency).add(n(s.balance.asset).multiply(s.period.close))
      let profit = n(consolidated).divide(orig_capital).subtract(1).value()
      process.stdout.write(z(8, formatPercent(profit), ' ')[profit >= 0 ? 'green' : 'red'])
      let buy_hold = n(orig_capital).divide(orig_price).multiply(s.period.close)
      let over_buy_hold_pct = n(consolidated).divide(buy_hold).subtract(1).value()
      process.stdout.write(z(8, formatPercent(over_buy_hold_pct), ' ')[over_buy_hold_pct >= 0 ? 'green' : 'red'])
    }
    if (!is_progress) {
      process.stdout.write('\n')
    }
  }

  function withOnPeriod (trade, period_id, cb) {
    if (!clock && so.mode !== 'live' && so.mode !== 'paper') clock = lolex.install({ shouldAdvanceTime: false, now: trade.time })

    updatePeriod(trade)
    if (!s.in_preroll) {
      if (so.mode !== 'live')
        s.exchange.processTrade(trade)

      if (!so.manual) {
        executeStop()

        if (clock) {
          var diff = trade.time - now()

          // Allow some catch-up if trades are too far apart. Don't want all calls happening at the same time
          while (diff > 5000) {
            clock.tick(5000)
            diff -= 5000
          }
          clock.tick(diff)
        }

        if (s.signal) {
          executeSignal(s.signal)
          s.signal = null
        }
      }
    }
    s.last_period_id = period_id
    cb()
  }

  function cancelOrder (order, type, do_reorder, cb) {
    s.exchange.cancelOrder({order_id: order.order_id, product_id: s.product_id}, function () {
      function checkHold (do_reorder, cb) {
        s.exchange.getOrder({order_id: order.order_id, product_id: s.product_id}, function (err, api_order) {
          if (api_order) {
            if (api_order.status === 'done') {
              order.time = new Date(api_order.done_at).getTime()
              order.price = api_order.price || order.price // Use actual price if possible. In market order the actual price (api_order.price) could be very different from trade price
              debug.msg('cancel failed, order done, executing')
              executeOrder(order, type)
              return syncBalance(function () {
                cb(null, order)
              })
            }

            s.api_order = api_order
            if (api_order.filled_size) {
              order.remaining_size = n(order.size).subtract(api_order.filled_size).format(s.product.asset_increment ? s.product.asset_increment : '0.00000000')
            }
          }
          syncBalance(function () {
            let on_hold
            if (type === 'buy') on_hold = n(s.balance.deposit).subtract(s.balance.currency_hold || 0).value() < n(order.price).multiply(order.remaining_size).value()
            else on_hold = n(s.balance.asset).subtract(s.balance.asset_hold || 0).value() < n(order.remaining_size).value()

            if (on_hold && s.balance.currency_hold > 0) {
              // wait a bit for settlement
              debug.msg('funds on hold after cancel, waiting 5s')
              setTimeout(function() { checkHold(do_reorder, cb) }, conf.wait_for_settlement)
            }
            else {
              cb(null, do_reorder ? null : false)
            }
          })
        })
      }
      checkHold(do_reorder, cb)
    })
  }
  function checkOrder (order, type, cb) {
    if (!s[type + '_order']) {
      // signal switched, stop checking order
      debug.msg('signal switched during ' + type + ', aborting')
      return cancelOrder(order, type, false, cb)
    }
    s.exchange.getOrder({order_id: order.order_id, product_id: s.product_id}, function (err, api_order) {
      if (err) return cb(err)
      s.api_order = api_order
      order.status = api_order.status
      if (api_order.reject_reason) order.reject_reason = api_order.reject_reason
      if (api_order.status === 'done') {
        order.time = new Date(api_order.done_at).getTime()
        order.price = api_order.price || order.price // Use actual price if possible. In market order the actual price (api_order.price) could be very different from trade price
        executeOrder(order, type)
        return syncBalance(function () {
          cb(null, order)
        })
      }
      if (order.status === 'rejected' && (order.reject_reason === 'post only' || api_order.reject_reason === 'post only')) {
        debug.msg('post-only ' + type + ' failed, re-ordering')
        return cb(null, null)
      }
      if (order.status === 'rejected' && order.reject_reason === 'balance') {
        debug.msg('not enough balance for ' + type + ', aborting')
        return cb(null, null)
      }
      if (now() - order.local_time >= so.order_adjust_time) {
        getQuote(function (err, quote) {
          if (err) {
            err.desc = 'could not execute ' + type + ': error fetching quote'
            return cb(err)
          }
          let marked_price
          if (type === 'buy') {
            marked_price = nextBuyForQuote(s, quote)
            if (so.exact_buy_orders && n(order.price).value() != marked_price) {
              debug.msg(marked_price + ' vs! our ' + order.price)
              cancelOrder(order, type, true, cb)
            }
            else if (n(order.price).value() < marked_price) {
              debug.msg(marked_price + ' vs our ' + order.price)
              cancelOrder(order, type, true, cb)
            }
            else {
              order.local_time = now()
              setTimeout(function() { checkOrder(order, type, cb) }, so.order_poll_time)
            }
          }
          else {
            marked_price = nextSellForQuote(s, quote)
            if (so.exact_sell_orders && n(order.price).value() != marked_price) {
              debug.msg(marked_price + ' vs! our ' + order.price)
              cancelOrder(order, type, true, cb)
            }
            else if (n(order.price).value() > marked_price) {
              debug.msg(marked_price + ' vs our ' + order.price)
              cancelOrder(order, type, true, cb)
            }
            else {
              order.local_time = now()
              setTimeout(function() { checkOrder(order, type, cb) }, so.order_poll_time)
            }
          }
        })
      }
      else {
        setTimeout(function() { checkOrder(order, type, cb) }, so.order_poll_time)
      }
    })
  }

  var tradeProcessingQueue = async.queue(function({trade, is_preroll}, callback){
    onTrade(trade, is_preroll, callback)
  })

  function queueTrade(trade, is_preroll){
    tradeProcessingQueue.push({trade, is_preroll})
  }

  function onTrade(trade, is_preroll, cb) {
    if (s.period && trade.time < s.period.time) {
      return
    }
    var day = (new Date(trade.time)).getDate()
    if (s.last_day && day !== s.last_day) {
      s.day_count++
    }
    s.last_day = day
    if (!s.period) {
      initBuffer(trade)
    }
    s.in_preroll = is_preroll || (so.start && trade.time < so.start)
    if (!s.period.last_try_trade && !s.in_preroll) {
      s.period.last_try_trade = now()
    }
    if(trade.time > s.period.close_time ||
      (!s.in_preroll && so.mode != 'sim' && moment.duration(moment(now()).diff(s.period.last_try_trade)).asMinutes() >= so.interval_trade)){
      var period_id = tb(trade.time).resize(so.period_length).toString()
      s.period.last_try_trade = now()
      s.strategy.onPeriod.call(s.ctx, s, function () {
        writeReport()
        s.acted_on_stop = false
        if (!s.in_preroll && !so.manual) {
          executeStop(true)
          if (s.signal) {
            executeSignal(s.signal)
          }
        }
        //s.action = null
        s.signal = null
        if (trade.time > s.period.close_time) {
          s.lookback.unshift(s.period)
          initBuffer(trade)
        }
        withOnPeriod(trade, period_id, cb)
      })
    }
    else {
      withOnPeriod(trade, period_id, cb)
    }
  }

  function onTrades(trades, is_preroll, cb) {
    if (_.isFunction(is_preroll)) {
      cb = is_preroll
      is_preroll = false
    }
    trades.sort(function (a, b) {
      if (a.time < b.time) return -1
      if (a.time > b.time) return 1
      return 0
    })
    var local_trades = trades.slice(0)
    var trade
    while( (trade = local_trades.shift()) !== undefined ) {
      queueTrade(trade, is_preroll)
    }
    if(_.isFunction(cb)) cb()
  }

  return {
    writeHeader: function () {
      process.stdout.write([
        z(19, 'DATE', ' ').grey,
        z(17, 'PRICE', ' ').grey,
        z(9, 'DIFF', ' ').grey,
        z(10, 'VOL', ' ').grey,
        z(8, 'RSI', ' ').grey,
        z(32, 'ACTIONS', ' ').grey,
        z(so.deposit ? 38 : 25, 'BAL', ' ').grey,
        z(22, 'PROFIT', ' ').grey
      ].join('') + '\n')
    },
    update: onTrades,
    exit: function (cb) {
      if(tradeProcessingQueue.length()){
        tradeProcessingQueue.drain = () => {
          if(s.strategy.onExit) {
            s.strategy.onExit.call( s.ctx, s )
          }
          cb()
        }
      } else {
        if(s.strategy.onExit) {
          s.strategy.onExit.call( s.ctx, s )
        }
        cb()
      }
    },

    executeSignal: executeSignal,
    writeReport: writeReport,
    syncBalance: syncBalance,
  }
}

