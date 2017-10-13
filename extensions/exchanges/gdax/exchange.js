var Gdax = require('gdax')
  , path = require('path')
  , colors = require('colors')
  , numbro = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')

  var public_client = {}, authed_client

  function publicClient (product_id) {
    if (!public_client[product_id]) {
      public_client[product_id] = new Gdax.PublicClient(product_id, c.gdax.apiURI)
    }
    return public_client[product_id]
  }

  function authedClient () {
    if (!authed_client) {
      if (!c.gdax || !c.gdax.key || c.gdax.key === 'YOUR-API-KEY') {
        throw new Error('please configure your GDAX credentials in conf.js')
      }
      authed_client = new Gdax.AuthenticatedClient(c.gdax.key, c.gdax.b64secret, c.gdax.passphrase, c.gdax.apiURI)
    }
    return authed_client
  }

  function statusErr (resp, body) {
    if (resp.statusCode !== 200) {
      var err = new Error('non-200 status: ' + resp.statusCode)
      err.code = 'HTTP_STATUS'
      err.body = body
      return err
    }
  }

  function retry (method, args, err) {
    if (method !== 'getTrades') {
      console.error(('\nGDAX API is down! unable to call ' + method + ', retrying in 10s').red)
      if (err) console.error(err)
      console.error(args.slice(0, -1))
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, 10000)
  }

  var orders = {}

  var exchange = {
    name: 'gdax',
    historyScan: 'backward',
    makerFee: 0,
    takerFee: 0.3,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient(opts.product_id)
      var args = {}
      if (opts.from) {
        // move cursor into the future
        args.before = opts.from
      }
      else if (opts.to) {
        // move cursor into the past
        args.after = opts.to
      }
      client.getProductTrades(args, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return retry('getTrades', func_args, err)
        var trades = body.map(function (trade) {
          return {
            trade_id: trade.trade_id,
            time: new Date(trade.time).getTime(),
            size: Number(trade.size),
            price: Number(trade.price),
            side: trade.side
          }
        })
        trades.reverse()
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.getAccounts(function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return retry('getBalance', func_args, err)
        var balance = {asset: 0, currency: 0}
        body.forEach(function (account) {
          if (account.currency === opts.currency) {
            balance.currency = account.balance
            balance.currency_hold = account.hold
          }
          else if (account.currency === opts.asset) {
            balance.asset = account.balance
            balance.asset_hold = account.hold
          }
        })
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient(opts.product_id)
      client.getProductTicker(function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return retry('getQuote', func_args, err)
        cb(null, {bid: body.bid, ask: body.ask})
      })
    },

    cancelOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.cancelOrder(opts.order_id, function (err, resp, body) {
        if (body && (body.message === 'Order already done' || body.message === 'order not found')) return cb()
        if (!err) err = statusErr(resp, body)
        if (err) return retry('cancelOrder', func_args, err)
        cb()
      })
    },

    buy: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      if (opts.order_type === 'taker') {
        delete opts.price
        delete opts.post_only
        delete opts.cancel_after
        opts.type = 'market'
      }
      else {
        opts.time_in_force = 'GTT'
      }
      delete opts.order_type
      client.buy(opts, function (err, resp, body) {
        if (body && body.message === 'Insufficient funds') {
          var order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }
        if (!err) err = statusErr(resp, body)
        if (err) return retry('buy', func_args, err)
        orders['~' + body.id] = body
        cb(null, body)
      })
    },

    sell: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      if (opts.order_type === 'taker') {
        delete opts.price
        delete opts.post_only
        delete opts.cancel_after
        opts.type = 'market'
      }
      else {
        opts.time_in_force = 'GTT'
      }
      delete opts.order_type
      client.sell(opts, function (err, resp, body) {
        if (body && body.message === 'Insufficient funds') {
          var order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }
        if (!err) err = statusErr(resp, body)
        if (err) return retry('sell', func_args, err)
        orders['~' + body.id] = body
        cb(null, body)
      })
    },

    getOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.getOrder(opts.order_id, function (err, resp, body) {
        if (!err && resp.statusCode !== 404) err = statusErr(resp, body)
        if (err) return retry('getOrder', func_args, err)
        if (resp.statusCode === 404) {
          // order was cancelled. recall from cache
          body = orders['~' + opts.order_id]
          body.status = 'done'
          body.done_reason = 'canceled'
        }
        cb(null, body)
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return trade.trade_id
    }
  }
  return exchange
}
