var BFX = require('bitfinex-api-node')
  , _ = require('lodash')
  , path = require('path')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  
  var public_client, authed_client

  function publicClient (product_id) {
    if (!public_client) public_client = new BFX.APIRest(product_id)
    return public_client
  }

  function authedClient () {
    if (!authed_client) {
    if (!c.bitfinex.key || c.bitfinex.key === 'YOUR-API-KEY') {
      throw new Error('please configure your Bitfinex credentials in ' + path.resolve(__dirname, 'conf.js'))
    }
    authed_client = new BFX.APIRest(c.bitfinex.key, c.bitfinex.secret)
  }
  return authed_client
  }
  
  function joinProduct (product_id) {
    return (product_id.split('-')[1] + '' + product_id.split('-')[0]).toLowerCase()
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
//    historyScan: 'backward',
    makerFee: 0.1,

    getProducts: function () {
      return require('./products.json')
    },
    getTrades: function (opts, cb) {
      var client = publicClient()      
      var args = {}
      //joinProduct(opts.product_id)
        
//      var path = args.pair;
      //if(opts.from)
//        path += '?limit_trades=49999';
      //
      client.trades(args, function (err, body) {
//        if (!err) err = statusErr(args, body)
//        if (err) return cb(err)
        var trades = _.map(body, function(trade) {
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
//      console.log (args, err, body, trades)
    },
/*
    getTrades: function (opts, cb) {
//      var client = publicClient(opts.product_id)
      var client = publicClient()      
      var args = {}
      if (opts.from) {
        // move cursor into the future
        args.before = opts.from
      }
      else if (opts.to) {
        // move cursor into the past
        args.after = opts.to
      }
      client.trades(args, function (err, resp, body) {

//        if (!err) err = statusErr(resp, body)
//        if (err) return cb(err)
        var trades = body.map(function (trade) {
          return {
            trade_id: trade.tid,
            time: new Date(trade.timestamp).getTime(),
            size: Number(trade.amount),
            price: Number(trade.price),
            side: trade.type
          }
        })
        cb(null, trades)
      })
    },
    */
/*
 *    var accounts =  _(wallets).filter(function (wallets) { return wallets.type === c.wallet }).map(function (account) { 
          if (account.currency.toUpperCase() === rs.currency) {
            rs.balance[rs.currency] = n(account.available).value()
          }
         else if (account.currency.toUpperCase() === rs.asset) {
            rs.balance[rs.asset] = n(account.available).value()*/

    
    
    getBalance: function (opts, cb) {
      var client = authedClient()
      client.wallet_balances(function (err, body) {
//        if (!err) err = statusErr(resp, body)
//       if (err) return cb(err)
        var balance = {asset: 0, currency: 0}
        var accounts = _(body).filter(function (body) { return body.type === c.bitfinex.wallet }).forEach(function (account) {
          if (account.currency === opts.currency) {
            balance.currency = account.amount
            balance.currency_hold = (account.amount - account.available)
          }
          else if (account.currency === opts.asset) {
            balance.asset = account.amount
            balance.asset_hold = (account.amount - account.available)
          }
        })
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
//      var client = publicClient(opts.product_id)
      var client = publicClient(opts.product_id)      
      client.ticker(function (err, body) {
//        if (!err) err = statusErr(resp, body)
//        if (err) return cb(err)
        cb(null, {bid: body.bid, ask: body.ask})
      })
    },

    cancelOrder: function (opts, cb) {
      var client = authedClient()
      client.cancel_order(opts.order_id, function (err, body) {
//        if (!err) err = statusErr(resp, body)
//        if (err) return cb(err)
        cb()
      })
    },

    cancelOrders: function (opts, cb) {
      var client = authedClient()
      client.cancel_all_orders(opts, function (err, body) {
//        if (!err) err = statusErr(resp, body)
//        if (err) return cb(err)
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
        client.new_order(opts.product_id, opts.size, opts.price, 'buy', opts.type, function (err, body) {
//          if (!err) err = statusErr(resp, body)
//          if (err) return cb(err)
          cb(null, body)
        })
      } else {
        //  GDAX client.buy(opts, function (err, resp, body) { 
        client.new_order(opts.product_id, opts.size, '1', 'bitfinex', 'buy', 'exchange market', false, function (err, body) {
//          if (!err) err = statusErr(resp, body)
//          if (err) return cb(err)
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
        client.new_order(opts.product_id, opts.size, opts.price, 'buy', opts.type, function (err, body) {
//          if (!err) err = statusErr(resp, body)
//          if (err) return cb(err)
          cb(null, body)
        })
      } else {
      client.new_order(opts.product_id, opts.size, '1', 'bitfinex', 'sell', 'exchange market', false, function (err, body) {
//        if (!err) err = statusErr(resp, body)
//        if (err) return cb(err)
        cb(null, body)
      })
      }
    },

    getOrder: function (opts, cb) {
      var client = authedClient()
      client.order_status(opts.order_id, function (err, body) {
//        if (!err) err = statusErr(resp, body)
//        if (err) return cb(err)
        cb(null, body)
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return trade.trade_id
    }
  }
}
