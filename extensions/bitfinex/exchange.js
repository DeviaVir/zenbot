var BFX = require('bitfinex-api-node')
  , path = require('path')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  var defs = require('./conf-sample')
  try {
    c.bitfinex = require('./conf')
  }
  catch (e) {
    c.bitfinex = {}
  }
  Object.keys(defs).forEach(function (k) {
    if (typeof c.bitfinex[k] === 'undefined') {
      c.bitfinex[k] = defs[k]
    }
  })

  function publicClient () {
    return new BFX.APIRest()
  }

  function authedClient () {
    if (c.bitfinex.key && c.bitfinex.key !== 'YOUR-API-KEY') {
      return new BFX.APIRest(c.bitfinex.key, c.bitfinex.secret)
    }
    throw new Error('please configure your Bitfinex credentials in ' + path.resolve(__dirname, 'conf.js'))
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
    name: 'bitfinex',

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var client = publicClient(opts.product_id)
      var args = {}
/*      if (opts.from) {
        // move cursor into the future
        args.before = opts.from
      }
      else if (opts.to) {
        // move cursor into the past
        args.after = opts.to
      }*/
console.log(args, opts)
      client.trades(args, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        var trades = body.map(function (trade) {
          return {
            trade_id: trade.tid,
            time: new Date(trade.timestamp).getTime(),
            size: Number(trade.amount),
            price: Number(trade.price),
            side: trade.type
          }
        })
console.log(trades)        
        cb(null, trades)
      })
    },
/*
 *    var accounts =  _(wallets).filter(function (wallets) { return wallets.type === c.wallet }).map(function (account) { 
          if (account.currency.toUpperCase() === rs.currency) {
            rs.balance[rs.currency] = n(account.available).value()
          }
         else if (account.currency.toUpperCase() === rs.asset) {
            rs.balance[rs.asset] = n(account.available).value()*/

    
    
    getBalance: function (opts, cb) {
      var client = authedClient()
      client.wallet_balances(function (err, resp, body) {
//        if (!err) err = statusErr(resp, body)
//       if (err) return cb(err)
        var balance = {asset: 0, currency: 0}
        body.filter(function (body) { return body.type === c.wallet }).forEach(function (account) {
          if (account.currency.toLowerCase() === opts.currency) {
            balance.currency = account.amount
            balance.currency_hold = (account.amount - acount.available)
          }
          else if (account.currency.toLowerCase() === opts.asset) {
            balance.asset = account.amount
            balance.asset_hold = (account.amount - acount.available)
          }
        })
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
      var client = publicClient(opts.product_id)
      client.ticker(function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, {bid: body.bid, ask: body.ask})
      })
    },

    cancelOrder: function (opts, cb) {
      var client = authedClient()
      client.cancel_order(opts.order_id, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb()
      })
    },

    cancelOrders: function (opts, cb) {
      var client = authedClient()
      client.cancel_all_orders(opts, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb()
      })
    },
/*
    buy: function (opts, cb) {
      var client = authedClient()
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      client.new_order(opts, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, body)
      })
    },
*/
buy: function (opts, cb) {
      var client = authedClient()
      if (typeof opts.type === 'undefined' ) {
        opts.type = limit
        }
      if (opts.type === 'exchange limit') {
        var limit_price = opts.price // Fix me
        //  GDAX client.buy(opts, function (err, resp, body) {
        client.new_order(opts.product_id, opts.size, opts.price, 'buy', opts.type, function (err, resp, body) {
          if (!err) err = statusErr(resp, body)
          if (err) return cb(err)
          cb(null, body)
        })
      } else {
        //  GDAX client.buy(opts, function (err, resp, body) { 
        client.new_order(opts.product_id, opts.size, '1', 'bitfinex', 'buy', 'exchange market', false, function (err, resp, body) {
          if (!err) err = statusErr(resp, body)
          if (err) return cb(err)
          cb(null, body)
        })
      }
    },


    sell: function (opts, cb) {
      var client = authedClient()
      if (typeof opts.type === 'undefined') {
        opts.type = limit
      }
      if (opts.type === 'exchange limit') {
        var limit_price = opts.price // Fix me
        //  GDAX client.buy(opts, function (err, resp, body) {
        client.new_order(opts.product_id, opts.size, opts.price, 'buy', opts.type, function (err, resp, body) {
          if (!err) err = statusErr(resp, body)
          if (err) return cb(err)
          cb(null, body)
        })
      } else {
      client.new_order(opts.product_id, opts.size, '1', 'bitfinex', 'sell', 'exchange market', false, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, body)
      })
      }
    },

    getOrder: function (opts, cb) {
      var client = authedClient()
      client.order_status(opts.order_id, function (err, resp, body) {
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
