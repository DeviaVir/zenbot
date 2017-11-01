const CEX = require('cexio-api-node')
var path = require('path')
var n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')

  var public_client, authed_client

  function publicClient () {
    if (!public_client) {
      public_client = new CEX().rest
    }
    return public_client
  }

  function authedClient () {
    if (!authed_client) {
      if (!c.cexio || !c.cexio.username || !c.cexio.key || c.cexio.key === 'YOUR-API-KEY') {
        throw new Error('please configure your CEX.IO credentials in ' + path.resolve(__dirname, 'conf.js'))
      }
      var nonce = Math.floor(new Date().getTime() / 1000)
      authed_client = new CEX(c.cexio.username, c.cexio.key, c.cexio.secret).rest
      authed_client.nonce = function () { return nonce++ }
    }
    return authed_client
  }

  function joinProduct (product_id) {
    return product_id.split('-')[0] + '/' + product_id.split('-')[1]
  }

  function retry (method, args) {
    if (method !== 'getTrades') {
      console.error(('\nCEX.IO API is down! unable to call ' + method + ', retrying in 10s').red)
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, 10000)
  }

  var orders = {}
  var exchange = {
    name: 'cexio',
    historyScan: 'forward',
    backfillRateLimit: 0,
    makerFee: 0,
    takerFee: 0.2,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      if (typeof opts.from === 'undefined') {
        var args = 1000
      } else {
        args = opts.from
      }
      var client = publicClient()
      var pair = joinProduct(opts.product_id)
      client.trade_history(pair, args, function (err, body) {
        if (err || typeof body === 'undefined' || body === 'error: Rate limit exceeded') return retry('getTrades', func_args, err)
        var trades = body.map(function (trade) {
          return {
            trade_id: Number(trade.tid),
            time: Number(trade.date) * 1000,
            size: Number(trade.amount),
            price: Number(trade.price),
            side: trade.type
          }
        })
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.account_balance(function (err, body) {
        if (err || typeof body === 'undefined' || body === 'error: Nonce must be incremented' || body === 'error: Rate limit exceeded') return retry('getBalance', func_args, err)
        var balance = { asset: 0, currency: 0 }
        balance.currency = n(body[opts.currency].available).add(body[opts.currency].orders).format('0.00000000')
        balance.currency_hold = n(body[opts.currency].orders).format('0.00000000')
        balance.asset = n(body[opts.asset].available).add(body[opts.asset].orders).format('0.00000000')
        balance.asset_hold = n(body[opts.asset].orders).format('0.00000000')
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      var pair = joinProduct(opts.product_id)
      client.ticker(pair, function (err, body) {
        if (err || typeof body === 'undefined') return retry('getQuote', func_args, err)
        cb(null, { bid: String(body.bid), ask: String(body.ask) })
      })
    },

    cancelOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.cancel_order(opts.order_id, function (err, body) {
        if (err) return retry('cancelOrder', func_args, err)
        cb()
      })
    },

    buy: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      var pair = joinProduct(opts.product_id)
      if (opts.order_type === 'taker') {
        delete opts.price
        delete opts.post_only
        opts.size = n(opts.size).multiply(opts.orig_price).value() // CEXIO estimates asset size and uses free currency to performe margin buy
        opts.type = 'market'
      }
      client.place_order(pair, 'buy', opts.size, opts.price, opts.type, function (err, body) {
        if (body === 'error: Error: Place order error: Insufficient funds.') {
          var order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }
        if (err) return retry('buy', func_args, err)
        order = {
          id: body && (body.complete === false || body.message) ? body.id : null,
          status: 'open',
          price: opts.price,
          size: opts.size,
          post_only: !!opts.post_only,
          created_at: new Date().getTime(),
          filled_size: '0',
          ordertype: opts.order_type
        }
        orders['~' + body.id] = order
        cb(null, order)
      })
    },

    sell: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      var pair = joinProduct(opts.product_id)
      if (opts.order_type === 'taker') {
        delete opts.price
        delete opts.post_only
        opts.type = 'market'
      }
      client.place_order(pair, 'sell', opts.size, opts.price, opts.type, function (err, body) {
        if (body === 'error: Error: Place order error: Insufficient funds.') {
          var order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }
        if (err) return retry('buy', func_args, err)
        order = {
          id: body && (body.complete === false || body.message) ? body.id : null,
          status: 'open',
          price: opts.price,
          size: opts.size,
          post_only: !!opts.post_only,
          created_at: new Date().getTime(),
          filled_size: '0',
          ordertype: opts.order_type
        }
        orders['~' + body.id] = order
        cb(null, order)
      })
    },

    getOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var order = orders['~' + opts.order_id]
      var client = authedClient()
      client.get_order_details(opts.order_id, function (err, body) {
        if (err || body === 'error: Invalid Order ID') return retry('getOrder', func_args, err)
        if (body.status === 'c') {
          order.status = 'rejected'
          order.reject_reason = 'canceled'
        }
        if (body.status === 'd' || body.status === 'cd') {
          order.status = 'done'
          order.done_at = new Date().getTime()
          order.filled_size = n(body.amount).subtract(body.remains).format('0.00000000')
        }
        cb(null, order)
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return trade.trade_id
    }
  }
  return exchange
}
