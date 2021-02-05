let path = require('path')
  , n = require('numbro')
  , _ = require('lodash')

module.exports = function sim (conf, s) {

  let latency = 100 // In milliseconds, enough to be realistic without being disruptive
  let so = s.options
  let exchange_id = so.selector.exchange_id
  let real_exchange = require(path.resolve(__dirname, `../${exchange_id}/exchange`))(conf)

  var now
  var balance = { asset: so.asset_capital, currency: so.currency_capital, asset_hold: 0, currency_hold: 0 }

  var last_order_id = 1001
  var orders = {}
  var openOrders = {}

  // When orders change in any way, it's likely our "_hold" values have changed. Recalculate them
  function recalcHold() {
    balance.currency_hold = 0
    balance.asset_hold = 0
    _.each(openOrders, function(order) {
      if (order.tradetype === 'buy') {
        balance.currency_hold += n(order.remaining_size).multiply(n(order.price)).value()
      }
      else {
        balance.asset_hold += n(order.remaining_size).value()
      }
    })
  }

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
      setTimeout(function() {
        s.sim_asset = balance.asset
        return cb(null, balance)
      }, latency)
    },

    getQuote: function (opts, cb) {
      if (so.mode === 'paper') {
        return real_exchange.getQuote(opts, cb)
      }
      else {
        setTimeout(function() {
          return cb(null, {
            bid: s.period.close,
            ask: s.period.close
          })
        }, latency)
      }
    },

    cancelOrder: function (opts, cb) {
      setTimeout(function() {
        var order_id = '~' + opts.order_id
        var order = orders[order_id]

        if (order.status === 'open') {
          order.status = 'cancelled'
          delete openOrders[order_id]
          recalcHold()
        }

        cb(null)
      }, latency)
    },

    buy: function (opts, cb) {
      setTimeout(function() {
        if (so.debug) console.log(`buying ${opts.size * opts.price} vs on hold: ${balance.currency} - ${balance.currency_hold} = ${balance.currency - balance.currency_hold}`)
        if (opts.size * opts.price > (balance.currency - balance.currency_hold)) {
          if (so.debug) console.log('nope')
          return cb(null, { status: 'rejected', reject_reason: 'balance'})
        }

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
        recalcHold()
        cb(null, order)
      }, latency)
    },

    sell: function (opts, cb) {
      setTimeout(function() {
        if (so.debug) console.log(`selling ${opts.size} vs on hold: ${balance.asset} - ${balance.asset_hold} = ${balance.asset - balance.asset_hold}`)
        if (opts.size > (balance.asset - balance.asset_hold)) {
          if (so.debug) console.log('nope')
          return cb(null, { status: 'rejected', reject_reason: 'balance'})
        }

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
        recalcHold()
        cb(null, order)
      }, latency)
    },

    getOrder: function (opts, cb) {
      setTimeout(function() {
        var order = orders['~' + opts.order_id]
        cb(null, order)
      }, latency)
    },

    setFees: function(opts) {
      if (so.mode === 'paper') {
        return real_exchange.setFees(opts)
      }
    },

    getCursor: real_exchange.getCursor,

    getTime: function() {
      return now
    },

    processTrade: function(trade) {
      var orders_changed = false
      
      now = trade.time

      _.each(openOrders, function(order) {
        if (trade.time - order.time < so.order_adjust_time) {
          return // Not time yet
        }
        if (order.tradetype === 'buy' && trade.price <= order.price) {
          processBuy(order, trade)
          orders_changed = true
        }
        else if (order.tradetype === 'sell' && trade.price >= order.price) {
          processSell(order, trade)
          orders_changed = true
        }
      })

      if (orders_changed)
        recalcHold()
    }
  }

  function processBuy (buy_order, trade) {
    let fee = 0
    let size = Math.min(buy_order.remaining_size, trade.size)
    let price = buy_order.price

    // Add estimated slippage to price
    if (so.order_type === 'maker') {
      price = n(price).add(n(price).multiply(so.avg_slippage_pct / 100)).format('0.00000000')
    }

    let total = n(price).multiply(size)

    // Compute fees
    if (so.order_type === 'maker' && exchange.makerFee) {
      fee = n(size).multiply(exchange.makerFee / 100).value()
    }
    else if (so.order_type === 'taker' && s.exchange.takerFee) {
      fee = n(size).multiply(exchange.takerFee / 100).value()
    }

    // Update balance
    balance.asset = n(balance.asset).add(size).subtract(fee).format('0.00000000')
    balance.currency = n(balance.currency).subtract(total).format('0.00000000')

    // Process existing order size changes
    let order = buy_order
    order.filled_size = order.filled_size + size
    order.remaining_size = order.size - order.filled_size

    if (order.remaining_size <= 0) {
      if (so.debug) console.log('full fill bought')
      order.status = 'done'
      order.done_at = trade.time
      delete openOrders['~' + order.id]
    }
    else {
      if (so.debug) console.log('partial fill buy')
    }
  }

  function processSell (sell_order, trade) {
    let fee = 0
    let size = Math.min(sell_order.remaining_size, trade.size)
    let price = sell_order.price

    // Add estimated slippage to price
    if (so.order_type === 'maker') {
      price = n(price).subtract(n(price).multiply(so.avg_slippage_pct / 100)).format('0.00000000')
    }

    let total = n(price).multiply(size)

    // Compute fees
    if (so.order_type === 'maker' && exchange.makerFee) {
      fee = n(total).multiply(exchange.makerFee / 100).value()
    }
    else if (so.order_type === 'taker' && exchange.takerFee) {
      fee = n(total).multiply(exchange.takerFee / 100).value()
    }

    // Update balance
    balance.asset = n(balance.asset).subtract(size).value()
    balance.currency = n(balance.currency).add(total).subtract(fee).format('0.00000000')

    // Process existing order size changes
    let order = sell_order
    order.filled_size = order.filled_size + size
    order.remaining_size = order.size - order.filled_size

    if (order.remaining_size <= 0) {
      if (so.debug) console.log('full fill sold')
      order.status = 'done'
      order.done_at = trade.time
      delete openOrders['~' + order.id]
    }
    else {
      if (so.debug) console.log('partial fill sell')
    }
  }

  return exchange
}
