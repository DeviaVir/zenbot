let path = require('path')
  , n = require('numbro')
  , _ = require('underscore')


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
      return cb(null, [])
    },

    getBalance: function (opts, cb) {
      return cb(null, balance)
    },

    getQuote: function (opts, cb) {
      return cb(null, {
        bid: s.period.close,
        ask: s.period.close
      })
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
        post_only: !!opts.post_only,
        filled_size: '0',
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
        post_only: !!opts.post_only,
        filled_size: '0',
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

    getCursor: function (trade) {
      return (trade.time || trade)
    },

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
            processBuy(order)
            order.done_at = trade.time
            delete openOrders[order_id]
          }
        }
        else if (order.tradetype === 'sell') {
          if (trade.time - order.time < so.order_adjust_time) {
            // Not time yet
          }
          else if (trade.price >= order.price) {
            processSell(order)
            order.done_at = trade.time
            delete openOrders[order_id]
          }
        }
      })
    }
  }

  function processBuy (buy_order) {
    let fee
    let price = buy_order.price
    if (so.order_type === 'maker') {
      if (exchange.makerFee) {
        fee = n(buy_order.size).multiply(exchange.makerFee / 100).value()
      }
    }
    if (so.order_type === 'taker') {
      if (s.exchange.takerFee) {
        fee = n(buy_order.size).multiply(exchange.takerFee / 100).value()
      }
    }

    balance.asset = n(balance.asset).add(buy_order.size).format('0.00000000')
    if (so.order_type === 'maker') {
      price = n(buy_order.price).add(n(buy_order.price).multiply(so.avg_slippage_pct / 100)).format('0.00000000')
      if (exchange.makerFee) {
        balance.asset = n(balance.asset).subtract(fee).format('0.00000000')
      }
    }
    if (so.order_type === 'taker') {
      if (exchange.takerFee) {
        balance.asset = n(balance.asset).subtract(fee).format('0.00000000')
      }
    }
    let total = n(price).multiply(buy_order.size)
    balance.currency = n(balance.currency).subtract(total).format('0.00000000')


    buy_order.status = 'done'
    buy_order.filled_size = buy_order.size
    buy_order.remaining_size = 0
  }

  function processSell (sell_order) {
    let fee
    let price = sell_order.price

    if (so.order_type === 'maker') {
      if (exchange.makerFee) {
        fee = n(sell_order.size).multiply(exchange.makerFee / 100).multiply(price).value()
      }
    }
    if (so.order_type === 'taker') {
      if (exchange.takerFee) {
        fee = n(sell_order.size).multiply(exchange.takerFee / 100).multiply(price).value()
      }
    }

    balance.asset = n(balance.asset).subtract(sell_order.size).value()
    if (so.order_type === 'maker') {
      price = n(sell_order.price).subtract(n(sell_order.price).multiply(so.avg_slippage_pct / 100)).format('0.00000000')
      if (exchange.makerFee) {
        fee = n(sell_order.size).multiply(exchange.makerFee / 100).multiply(price).value()
        balance.currency = n(balance.currency).subtract(fee).format('0.00000000')
      }
    }
    if (so.order_type === 'taker') {
      if (exchange.takerFee) {
        balance.currency = n(balance.currency).subtract(fee).format('0.00000000')
      }
    }
    let total = n(price).multiply(sell_order.size)
    balance.currency = n(balance.currency).add(total).value()

    sell_order.status = 'done'
    sell_order.filled_size = sell_order.size
    sell_order.remaining_size = 0
  }

  return exchange
}
