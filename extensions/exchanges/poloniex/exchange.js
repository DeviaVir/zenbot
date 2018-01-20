var Poloniex = require('poloniex.js')
  , path = require('path')
  , moment = require('moment')
  , n = require('numbro')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('conf')

  var public_client, authed_client

  function publicClient (product_id) {
    if (!public_client) public_client = new Poloniex(c.poloniex.key, c.poloniex.secret)
    return public_client
  }

  function authedClient () {
    if (!authed_client) {
      if (!c.poloniex || !c.poloniex.key || c.poloniex.key === 'YOUR-API-KEY') {
        throw new Error('please configure your Poloniex credentials in conf.js')
      }
      authed_client = new Poloniex(c.poloniex.key, c.poloniex.secret)
    }
    return authed_client
  }

  function joinProduct (product_id) {
    return product_id.split('-')[1] + '_' + product_id.split('-')[0]
  }

  function retry (method, args) {
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, 1)
  }

  var orders = {}

  var exchange = {
    name: 'poloniex',
    historyScan: 'backward',
    makerFee: 0.15,
    takerFee: 0.25,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      var args = {
        currencyPair: joinProduct(opts.product_id)
      }
      if (opts.from) {
        args.start = opts.from
      }
      if (opts.to) {
        args.end = opts.to
      }
      if (args.start && !args.end) {
        // add 12 hours
        args.end = args.start + 43200
      }
      else if (args.end && !args.start) {
        // subtract 12 hours
        args.start = args.end - 43200
      }

      client._public('returnTradeHistory', args, function (err, body) {
        if (err) return cb(err)
        if (typeof body === 'string') {
          return retry('getTrades', func_args)
        }
        if (!body.map) {
          console.error('\ngetTrades odd result:')
          console.error(body)
          return retry('getTrades', func_args)
        }
        var trades = body.map(function (trade) {
          return {
            trade_id: trade.tradeID,
            time: moment.utc(trade.date).valueOf(),
            size: Number(trade.amount),
            price: Number(trade.rate),
            side: trade.type
          }
        })
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var args = [].slice.call(arguments)
      var client = authedClient()
      client.returnCompleteBalances(function (err, body) {
        if (err) return cb(err)
        var balance = {asset: 0, currency: 0}
        if (typeof body === 'string') {
          return retry('getBalance', args)
        }
        if (body.error) {
          console.error('\ngetBalance error:')
          console.error(body)
          return retry('getBalance', args)
        }
        if (body[opts.currency]) {
          balance.currency = n(body[opts.currency].available).add(body[opts.currency].onOrders).format('0.00000000')
          balance.currency_hold = body[opts.currency].onOrders
        }
        if (body[opts.asset]) {
          balance.asset = n(body[opts.asset].available).add(body[opts.asset].onOrders).format('0.00000000')
          balance.asset_hold = body[opts.asset].onOrders
        }
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
      var args = [].slice.call(arguments)
      var client = publicClient()
      var product_id = joinProduct(opts.product_id)
      client.getTicker(function (err, body) {
        if (err) return cb(err)
        if (typeof body === 'string') {
          return retry('getQuote', args)
        }
        if (body.error) {
          console.error('\ngetQuote error:')
          console.error(body)
          return retry('getQuote', args)
        }
        var quote = body[product_id]
        if (!quote) return cb(new Error('no quote for ' + product_id))
        if (quote.isFrozen == '1') console.error('\nwarning: product ' + product_id + ' is frozen')
        cb(null, {
          bid: quote.highestBid,
          ask: quote.lowestAsk,
        })
      })
    },

    cancelOrder: function (opts, cb) {
      var args = [].slice.call(arguments)
      var client = authedClient()
      client._private('cancelOrder', {orderNumber: opts.order_id}, function (err, result) {
        if (typeof result === 'string') {
          return retry('cancelOrder', args)
        }
        if (!err && !result.success) {
          // sometimes the order gets cancelled on the server side for some reason and we get this. ignore that case...
          if (result.error !== 'Invalid order number, or you are not the person who placed the order.') {
            err = new Error('unable to cancel order')
            err.body = result
          }
        }
        cb(err)
      })
    },

    trade: function (type, opts, cb) {
      var args = [].slice.call(arguments)
      var client = authedClient()
      var params = {
        currencyPair: joinProduct(opts.product_id),
        rate: opts.price,
        amount: opts.size,
        postOnly: opts.post_only === false ? '0' : '1'
      }
      client._private(type, params, function (err, result) {
        if (typeof result === 'string') {
          return retry('trade', args)
        }
        var order = {
          id: result ? result.orderNumber : null,
          status: 'open',
          price: opts.price,
          size: opts.size,
          post_only: !!opts.post_only,
          created_at: new Date().getTime(),
          filled_size: '0'
        }
        if (result && result.error === 'Unable to place post-only order at this price.') {
          order.status = 'rejected'
          order.reject_reason = 'post only'
          return cb(null, order)
        }
        else if (result && result.error && result.error.match(/^Not enough/)) {
          order.status = 'rejected'
          order.reject_reason = 'balance'
          return cb(null, order)
        }
        if (!err && result.error) {
          err = new Error('unable to ' + type)
          err.body = result
        }
        if (err) return cb(err)
        orders['~' + result.orderNumber] = order
        cb(null, order)
      })
    },

    buy: function (opts, cb) {
      exchange.trade('buy', opts, cb)
    },

    sell: function (opts, cb) {
      exchange.trade('sell', opts, cb)
    },

    getOrder: function (opts, cb) {
      var args = [].slice.call(arguments)
      var order = orders['~' + opts.order_id]
      if (!order) return cb(new Error('order not found in cache'))
      var client = authedClient()
      var params = {
        currencyPair: joinProduct(opts.product_id)
      }
      client._private('returnOpenOrders', params, function (err, body) {
        if (err) return cb(err)
        if (typeof body === 'string' || !body) {
          return retry('getOrder', args)
        }
        var active = false
        if (!body.forEach) {
          console.error('\nreturnOpenOrders odd result in checking state of order, trying again')
          //console.error(body)
          return retry('getOrder', args)
        }
        else {
          body.forEach(function (api_order) {
            if (api_order.orderNumber == opts.order_id) active = true
          })
        }
        if (!active) {
          order.status = 'done'
          order.done_at = new Date().getTime()
          return cb(null, order)
        }
        client.returnOrderTrades(opts.order_id, function (err, body) {
          if (typeof body === 'string' || !body) {
            return retry('getOrder', args)
          }
          if (err || body.error || !body.forEach) return cb(null, order)
          order.filled_size = '0'
          body.forEach(function (trade) {
            order.filled_size = n(order.filled_size).add(trade.amount).format('0.00000000')
          })
          if (n(order.filled_size).value() == n(order.size).value()) {
            order.status = 'done'
            order.done_at = new Date().getTime()
          }
          cb(null, order)
        })
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return Math.floor((trade.time || trade) / 1000)
    }
  }
  return exchange
}
