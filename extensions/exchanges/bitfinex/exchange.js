const BFX = require('bitfinex-api-node')
var _ = require('lodash')
  , path = require('path')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  
  var public_client, authed_client
  
  function publicClient () {
    if (!public_client) public_client = new BFX(null,null, {version: 2, transform: true}).rest
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
  
  function encodeQueryData(data) {
    let ret = []
    for (let d in data)
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
    return ret.join('&')
  }
  
  var orders = {}
  
  var exchange = {
    name: 'bitfinex',
    historyScan: 'backward',
    makerFee: 0.1,
    takerFee: 0.2,
    
    getProducts: function () {
      return require('./products.json')
    },
    
    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      var args = {}
      args.sort = -1 //backward
      args.limit = 1000
      if (opts.from) {
        args.start = opts.from
      }
      else if (opts.to) {
        args.end = opts.to
      }
      else if (args.start && !args.end) {
        args.end = args.start + 500000
      }
      else if (args.end && !args.start) {
        args.start = args.end - 500000
      }
      var query = encodeQueryData(args)
      var pair = 't' + joinProduct(opts.product_id)
      client.makePublicRequest('trades/' + pair + '/hist?' + query, function (err, body) {
        if (err) return retry('getTrades', func_args, err)
        var trades = body.map(function(trade) {
          return {
            trade_id: trade.ID,
            time: trade.MTS,
            size: Math.abs(trade.AMOUNT),
            price: trade.PRICE,
            side: trade.AMOUNT > 0 ? 'buy' : 'sell'
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
      var pair = 't' + joinProduct(opts.product_id)
      client.ticker(pair, function (err, body) {
        if (err) return retry('getQuote', func_args, err)
        cb(null, { bid : String(body.BID), ask : String(body.ASK) })
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
      if (opts.order_type === 'maker' && typeof opts.type === 'undefined') {
        opts.type = 'exchange limit'
      }
      else if (opts.order_type === 'taker' && typeof opts.type === 'undefined') {
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
            ordertype: opts.order_type
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
      if (opts.order_type === 'maker' && typeof opts.type === 'undefined') {
        opts.type = 'exchange limit'
      }
      else if (opts.order_type === 'taker' && typeof opts.type === 'undefined') {
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
          ordertype: opts.order_type
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
      client.order_status(opts.order_id, function (err, body) {
      if (err) return(err)
        if (!body.id) {
          return cb('Order not found')
        }
        if (body.is_cancelled  === true && body.is_live === false) {
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
      return trade.time
    }
  }
  return exchange
}
