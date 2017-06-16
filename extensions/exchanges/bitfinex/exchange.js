const BFX = require('bitfinex-api-node')
var _ = require('lodash')
  , path = require('path')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')

  var public_client, authed_client

  function publicClient () {
    if (!public_client) public_client = new BFX(null,null, {version: 1}).rest
    return public_client
  }

  function authedClient () {
    if (!authed_client) {
    if (!c.bitfinex || !c.bitfinex.key || c.bitfinex.key === 'YOUR-API-KEY') {
      throw new Error('please configure your Bitfinex credentials in ' + path.resolve(__dirname, 'conf.js'))
    }
    authed_client = new BFX(c.bitfinex.key, c.bitfinex.secret, {version: 1}).rest
  }
  return authed_client
  }

  function joinProduct (product_id) {
    return product_id.split('-')[0] + '' + product_id.split('-')[1]
  }

  function retry (method, args) {
    if (method !== 'getTrades') {
      console.error(('\nBitfinex API is down! unable to call ' + method + ', retrying in 10s').red)
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, 10000)
  }

  var orders = {}
  var exchange = {
    name: 'bitfinex',
  //    historyScan: 'backward',
    makerFee: 0.1,
    takerFee: 0.2,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      var args = joinProduct(opts.product_id)
      client.trades(args, function (err, body) {
        if (err) return retry('getTrades', func_args, err)
        var trades = body.map(function(trade) {
          return {
            trade_id: trade.tid,
            time: n(trade.timestamp).multiply(1000).value(),
            size: Number(trade.amount),
            price: Number(trade.price),
            side: trade.type
          }
        })
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var client = authedClient()
      client.wallet_balances(function (err, body) {
        if (err) return(err)
        var balance = {asset: 0, currency: 0}
        var accounts = _(body).filter(function (body) { return body.type === c.bitfinex.wallet }).forEach(function (account) {
          if (account.currency.toUpperCase() === opts.currency) {
            balance.currency = n(account.amount).format('0.00000000')
            balance.currency_hold = n(account.amount).subtract(account.available).format('0.00000000')
          }
          else if (account.currency.toUpperCase() === opts.asset) {
            balance.asset = n(account.amount).format('0.00000000')
            balance.asset_hold = n(account.amount).subtract(account.available).format('0.00000000')
          }
        })
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      var pair = joinProduct(opts.product_id)
      client.ticker(pair, function (err, body) {
        if (err) return retry('getQuote', func_args, err)
        cb(null, { bid : body.bid, ask : body.ask })
      })
    },

    cancelOrder: function (opts, cb) {
      var client = authedClient()
      client.cancel_order(opts.order_id, function (err, body) {
        if (err) return(err)
        cb()
      })
    },

    buy: function (opts, cb) {
      var client = authedClient()
      if (c.order_type === 'maker' && typeof opts.type === 'undefined') {
        opts.type = 'exchange limit'
      }
      else if (c.order_type === 'taker' && typeof opts.type === 'undefined') {
        opts.type = 'exchange market'
      }
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      var symbol = joinProduct(opts.product_id)
      var amount = opts.size
      var price = opts.price
      var exchange = 'bitfinex'
      var side = 'buy'
      var type = opts.type
      var is_hidden = false
      var is_postonly = opts.post_only
      var params = {
        symbol,
        amount,
        price,
        exchange,
        side,
        type,
        is_hidden,
        is_postonly
      }
      client.make_request('order/new', params, function (err, body) {
          var order = {
            id: body && body.is_live === true ? body.order_id : null,
            status: 'open',
            price: opts.price,
            size: opts.size,
            post_only: !!opts.post_only,
            created_at: new Date().getTime(),
            filled_size: '0',
            ordertype: c.order_type
          }
        if (err && err.toString('Error: Invalid order: not enough exchange balance')) {
          status: 'rejected'
          reject_reason: 'balance'
          return cb(null, order)
        }
        if (err) return(err)
        orders['~' + body.id] = order
        cb(null, order)
      })
    },

    sell: function (opts, cb) {
      var client = authedClient()
      if (c.order_type === 'maker' && typeof opts.type === 'undefined') {
        opts.type = 'exchange limit'
      }
      else if (c.order_type === 'taker' && typeof opts.type === 'undefined') {
        opts.type = 'exchange market'
      }
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      var symbol = joinProduct(opts.product_id)
      var amount = opts.size
      var price = opts.price
      var exchange = 'bitfinex'
      var side = 'sell'
      var type = opts.type
      var is_hidden = false
      var is_postonly = opts.post_only
      var params = {
        symbol,
        amount,
        price,
        exchange,
        side,
        type,
        is_hidden,
        is_postonly
      }
      client.make_request('order/new', params, function (err, body) {
        var order = {
          id: body && body.is_live === true ? body.order_id : null,
          status: 'open',
          price: opts.price,
          size: opts.size,
          post_only: !!opts.post_only,
          created_at: new Date().getTime(),
          filled_size: '0',
          ordertype: c.order_type
        }
        if (err && err.toString('Error: Invalid order: not enough exchange balance')) {
          status: 'rejected'
          reject_reason: 'balance'
          return cb(null, order)
        }
        if (err) return(err)
        orders['~' + body.id] = order
        cb(null, order)
      })
    },

    getOrder: function (opts, cb) {
      var order = orders['~' + opts.order_id]
      var client = authedClient()
      client.order_status(opts.order_id, function (err, body) {if (err) return(err)
        if (!body.id) {
          return cb('Order not found')
        }
        if (body.is_cancelled  === true && body.is_live === false) {
          order.status = 'rejected'
          order.reject_reason = 'post only'
          order.done_at = new Date().getTime()
          return cb(null, order)
        }
        if (body.is_cancelled  === true && err.toString('Postonly Canceled')) {
          order.status = 'rejected'
          order.reject_reason = 'post only'
          order.done_at = new Date().getTime()
          return cb(null, order)
        }
        if (body.is_live === false) {
          order.status = 'done'
          order.done_at = new Date().getTime()
          order.filled_size = body.original_amount - body.executed_amount
          return cb(null, order)
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
