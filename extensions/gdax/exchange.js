var Gdax = require('gdax')
  , path = require('path')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  var defs = require('./conf-sample')
  try {
    c.gdax = require('./conf')
  }
  catch (e) {
    c.gdax = {}
  }
  Object.keys(defs).forEach(function (k) {
    if (typeof c.gdax[k] === 'undefined') {
      c.gdax[k] = defs[k]
    }
  })

  function publicClient (product_id) {
    return new Gdax.PublicClient(product_id, c.gdax.apiURI)
  }

  function authedClient () {
    if (c.gdax.key && c.gdax.key !== 'YOUR-API-KEY') {
      return new Gdax.AuthenticatedClient(c.gdax.key, c.gdax.b64secret, c.gdax.passphrase, c.gdax.apiURI)
    }
    throw new Error('please configure your GDAX credentials in ' + path.resolve(__dirname, 'conf.js'))
  }

  function statusErr (resp, body) {
    if (resp.statusCode !== 200) {
      var err = new Error('non-200 status: ' + resp.statusCode)
      err.code = 'HTTP_STATUS'
      err.body = body
      return err
    }
  }

  return {
    name: 'gdax',

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
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
        if (err) return cb(err)
        var trades = body.map(function (trade) {
          return {
            trade_id: trade.trade_id,
            time: new Date(trade.time).getTime(),
            size: Number(trade.size),
            price: Number(trade.price),
            side: trade.side
          }
        })
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var client = authedClient()
      client.getAccounts(function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        var balance = {asset: 0, currency: 0}
        body.forEach(function (account) {
          if (account.currency === opts.currency) {
            balance.currency = account.balance
          }
          else if (account.currency === opts.asset) {
            balance.asset = account.balance
          }
        })
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
      var client = publicClient(opts.product_id)
      client.getProductTicker(function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, {bid: body.bid, ask: body.ask})
      })
    },

    cancelOrder: function (opts, cb) {
      var client = authedClient()
      client.cancelOrder(opts.order_id, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb()
      })
    },

    cancelOrders: function (opts, cb) {
      var client = authedClient()
      client.cancelAllOrders(opts, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb()
      })
    },

    buy: function (opts, cb) {
      var client = authedClient()
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      client.buy(opts, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, body)
      })
    },

    sell: function (opts, cb) {
      var client = authedClient()
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      client.sell(opts, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, body)
      })
    },

    getOrder: function (opts, cb) {
      var client = authedClient()
      client.getOrder(opts.order_id, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, body)
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return trade.trade_id
    }
  }
}