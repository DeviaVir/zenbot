//
// Warning - Some of the functions need testing
// by someone in posession of a BTCe account
// In particular this is the case for
// the buy, sell, cancelOrderand getOrderfunctions
//
var BTCE = require('btce')
  , path = require('path')
  , colors = require('colors')
  , numbro = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')

  var public_client, authed_client

  function publicClient () {
    if (!public_client) {
      public_client = new BTCE()
    }
    return public_client
  }

  function authedClient () {
    if (!authed_client) {
      if (!c.btce || !c.btce.key || c.btce.key === 'YOUR-API-KEY') {
        throw new Error('please configure your BTCe credentials in conf.js')
      }
      authed_client = new BTCE(c.btce.key, c.btce.secret)
    }
    return authed_client
  }

  function joinProduct (product_id) {
    return product_id.split('-')[0] + '_' + product_id.split('-')[1]
  }

  function statusErr (err, body) {
    if (body === null) {
      return new Error(err)
    } else if (!body.success) {
      if (body.error === 'invalid api key' || body.error === 'invalid sign') {
        console.log(err)
        throw new Error('please correct your BTCe credentials in conf.js')
      } else if (err) {
        return new Error('\nError: ' + err)
      }
    } else {
      return body
    }
  }


  function retry (method, args, err) {
    if (method !== 'getTrades') {
      console.error(('\nBTCe API is down! unable to call ' + method + ', retrying in 10s').red)
      if (err) console.error(err)
      console.error(args.slice(0, -1))
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, 10000)
  }

  var orders = {}

  var exchange = {
    name: 'btce',
    historyScan: 'false',
    makerFee: 0.2,
    takerFee: 0.2,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      var pair = joinProduct(opts.product_id).toLowerCase()
      var args = {}
      if (opts.from) {
        // move cursor into the future
        args.before = opts.from
      }
      else if (opts.to) {
        // move cursor into the past
        args.after = opts.to
      }
      client.trades({ pair: pair, count: 1000 }, function (err, body) {
        if (err) return retry('getTrades', func_args, err)
        var trades = body.map(function (trade) {
          return {
            trade_id: trade.tid,
            time: trade.date * 1000,
            //time: new Date(trade.date).getTime(),
            size: trade.amount,
            price: trade.price,
            side: trade.trade_type
          }
        })
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var args = {
        currency: opts.currency.toLowerCase(),
        asset: opts.asset.toLowerCase(),
        wait: 10
      }
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.getInfo(function (err, body) {
        body = statusErr(err, body)
        if (err) {
          return retry('getBalance', func_args, err)
        }
        if (body.success) {
          var balance = {asset: 0, currency: 0}
          var funds = body.return.funds
          balance.currency = funds[args.currency]
          balance.asset = funds[args.asset]
          balance.currency_hold = 0
          balance.asset_hold = 0
          cb(null, balance)
        } else {
        }
      })
    },

    getQuote: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      var pair = joinProduct(opts.product_id).toLowerCase()
      client.ticker({ pair: pair }, function (err, body) {
        if (err) return retry('getQuote', func_args, err)
        cb(null, { bid: body.ticker.buy, ask: body.ticker.sell })
      })
    },

    cancelOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.cancelOrder(opts.order_id, function (err, resp, body) {
        body = statusErr(err, body)
        // Fix me - Check return codes
        if (body && (body.message === 'Order already done' || body.message === 'order not found')) return cb()
        if (err) return retry('cancelOrder', func_args, err)
        cb()
      })
    },

    trade: function (type, opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authed_client()
      var pair = joinProduct(opts.product_id)
      /* BTCe has no order type?
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      if (opts.order_type === 'taker') {
        delete opts.price
        delete opts.post_only
        opts.type = 'market'
      }
      */
      delete opts.order_type
      delete opts.cancel_after
      client.trade({'pair': pair, 'type': type, 'rate': opts.price, 'amount': opts.size }, function(err, body) {
        body = statusErr(err, body)
        // Fix me - Check return codes from API
        if (body && body.message === 'Insufficient funds') {
          var order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }
        if (err) return retry(type, func_args, err)
        orders['~' + body.id] = body
        cb(null,body)
        //else console.log(err)
      })
    },

    buy: function (opts, cb) {
      exchange.trade('buy', opts, cb)
    },

    sell: function (opts, cb) {
      exchange.trade('sell', opts, cb)
    },

    getOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      // Fix me - Check return result
      var orderInfo = {
        //from: opts.order_id,
        count: 1,
        from_id: opts.order_id,
        //end_id: opts.order_id,
        pair: opts.product_id
      }
      client.activeOrders(orderInfo, function (err, resp, body){
        body = statusErr(err, body)
        if (err) return retry('getOrder', func_args, err)
        if (resp.statusCode === 404) {
          // order was cancelled. recall from cache
          body = orders['~' + opts.order_id]
          body.status = 'done'
          body.done_reason = 'canceled'
        }
        // Fix me
        body.filled_size = 0
        body.remaining_size = resp.return[opts.order_id].amount
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
