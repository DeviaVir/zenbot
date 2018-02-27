let path = require('path')
  , n = require('numbro')
  , _ = require('lodash')


module.exports = function sim (conf, s) {

  let so = s.options
  let exchange_id = so.selector.exchange_id
  let real_exchange = require(path.resolve(__dirname, `../${exchange_id}/exchange`))(conf)

  var now
  var balance = { asset: so.asset_capital, currency: so.currency_capital }

  var last_order_id = 1001
  var orders = {}
  var openOrders = {}

  var exchange = {
    name: 'sim',
    historyScan: real_exchange.historyScan,
    historyScanUsesTime: real_exchange.historyScanUsesTime,
    makerFee: real_exchange.makerFee,
    takerFee: real_exchange.takerFee,
    dynamicFees: real_exchange.dynamicFees,

    getProducts: real_exchange.getProducts,

    getTrades: function (opts, cb) {
      if (so.mode === 'paper') {
        return real_exchange.getTrades(opts, cb)
      }
      else {
        return cb(null, [])
      }
    },

    getBalance: function (opts, cb) {
      return cb(null, balance)
    },

    getQuote: function (opts, cb) {
      if (so.mode === 'paper') {
        return real_exchange.getQuote(opts, cb)
      }
      else {
        return cb(null, {
          bid: s.period.close,
          ask: s.period.close
        })
      }
    },

    cancelOrder: function (opts, cb) {
      var order_id = '~' + opts.order_id
      var order = orders[order_id]

      if (order.status === 'open') {
        order.status = 'cancelled'
        delete openOrders[order_id]
      }

      cb(null)
    },

    buy: function (opts, cb) {
      var result = {
        id: last_order_id++
      }

      var order = {
        id: result.id,
        status: 'open',
        price: opts.price,
        size: opts.size,
        orig_size: opts.size,
        remaining_size: opts.size,
        post_only: !!opts.post_only,
        filled_size: 0,
        ordertype: opts.order_type,
        tradetype: 'buy',
        orig_time: now,
        time: now,
        created_at: now

      }
      orders['~' + result.id] = order
      openOrders['~' + result.id] = order
      cb(null, order)
    },

    sell: function (opts, cb) {
      var result = {
        id: last_order_id++
      }

      var order = {
        id: result.id,
        status: 'open',
        price: opts.price,
        size: opts.size,
        orig_size: opts.size,
        remaining_size: opts.size,
        post_only: !!opts.post_only,
        filled_size: 0,
        ordertype: opts.order_type,
        tradetype: 'sell',
        orig_time: now,
        time: now,
        created_at: now
      }
      orders['~' + result.id] = order
      openOrders['~' + result.id] = order
      cb(null, order)
    },

    getOrder: function (opts, cb) {
      var order = orders['~' + opts.order_id]
      cb(null, order)
    },

    getCursor: real_exchange.getCursor,

    getTime: function() {
      return now
    },

    processTrade: function(trade) {
      now = trade.time

      _.each(openOrders, function(order, order_id) {
        if (order.tradetype === 'buy') {
          if (trade.time - order.time < so.order_adjust_time) {
            // Not time yet
          }
          else if (trade.price <= Number(order.price)) {
            processBuy(order, trade)
          }
        }
        else if (order.tradetype === 'sell') {
          if (trade.time - order.time < so.order_adjust_time) {
            // Not time yet
          }
          else if (trade.price >= order.price) {
            processSell(order, trade)
          }
        }
      })
    }
  }

  function processBuy (buy_order, trade) {
    let fee = 0
    let size = Math.min(buy_order.remaining_size, trade.size)
    let price = buy_order.price

    // Buying, so add asset
    balance.asset = n(balance.asset).add(size).format('0.00000000')

    if (so.order_type === 'maker') {
      if (exchange.makerFee) {
        fee = n(size).multiply(exchange.makerFee / 100).value()
      }
    }
    else if (so.order_type === 'taker') {
      if (s.exchange.takerFee) {
        fee = n(size).multiply(exchange.takerFee / 100).value()
      }
    }
    if (so.order_type === 'maker') {
      price = n(price).add(n(price).multiply(so.avg_slippage_pct / 100)).format('0.00000000')
      if (exchange.makerFee) {
        balance.asset = n(balance.asset).subtract(fee).format('0.00000000')
      }
    }
    else if (so.order_type === 'taker') {
      if (exchange.takerFee) {
        balance.asset = n(balance.asset).subtract(fee).format('0.00000000')
      }
    }

    let total = n(price).multiply(size)
    balance.currency = n(balance.currency).subtract(total).format('0.00000000')

    let order = buy_order
    order.filled_size = order.filled_size + size
    order.remaining_size = order.size - order.filled_size

    if (order.remaining_size <= 0) {
      order.status = 'done'
      order.done_at = trade.time
      delete openOrders['~' + order.id]
    }
    else {
      // console.log('partial fill')
    }
  }

  function processSell (sell_order, trade) {
    let fee = 0
    let size = Math.min(sell_order.remaining_size, trade.size)
    let price = sell_order.price

    // Selling, so subtract asset
    balance.asset = n(balance.asset).subtract(size).value()

    if (so.order_type === 'maker') {
      if (exchange.makerFee) {
        fee = n(size).multiply(exchange.makerFee / 100).value()
      }
    }
    else if (so.order_type === 'taker') {
      if (exchange.takerFee) {
        fee = n(size).multiply(exchange.takerFee / 100).value()
      }
    }
    if (so.order_type === 'maker') {
      price = n(price).subtract(n(price).multiply(so.avg_slippage_pct / 100)).format('0.00000000')
      if (exchange.makerFee) {
        fee = n(size).multiply(exchange.makerFee / 100).multiply(price).value()
        balance.currency = n(balance.currency).subtract(fee).format('0.00000000')
      }
    }
    else if (so.order_type === 'taker') {
      if (exchange.takerFee) {
        balance.currency = n(balance.currency).subtract(fee).format('0.00000000')
      }
    }

    let total = n(price).multiply(size)
    balance.currency = n(balance.currency).add(total).format('0.00000000')

    let order = sell_order
    order.filled_size = order.filled_size + size
    order.remaining_size = order.size - order.filled_size

    if (order.remaining_size <= 0) {
      order.status = 'done'
      order.done_at = trade.time
      delete openOrders['~' + order.id]
    }
    else {
      // console.log('partial fill')
    }
  }

  return exchange
}
