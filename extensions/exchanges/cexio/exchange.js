const CEX = require('cexio-api-node')
var path = require('path')
var n = require('numbro')
var minimist = require('minimist')

module.exports = function cexio (conf) {
  var s = {
    options: minimist(process.argv)
  }
  var so = s.options

  var public_client, authed_client

  function publicClient () {
    if (!public_client) {
      public_client = new CEX().rest
    }
    return public_client
  }

  function authedClient () {
    if (!authed_client) {
      if (!conf.cexio || !conf.cexio.username || !conf.cexio.key || conf.cexio.key === 'YOUR-API-KEY') {
        throw new Error('please configure your CEX.IO credentials in ' + path.resolve(__dirname, 'conf.js'))
      }
      authed_client = new CEX(conf.cexio.username, conf.cexio.key, conf.cexio.secret).rest
    }
    return authed_client
  }

  function joinProduct (product_id) {
    return product_id.split('-')[0] + '/' + product_id.split('-')[1]
  }

  function retry (method, args) {
    if (so.debug && method !== 'getTrades') {
      console.error(('\nCEX.IO API is down! unable to call ' + method + ', retrying in 10s').red)
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, 10000)
  }

  function refreshFees(args) {
    var skew = 5000 // in ms
    var now = new Date()
    var nowUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds())
    var midnightUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()).setHours(24,0,0,0)
    var countdown = midnightUTC - nowUTC + skew
    if (so.debug) {
      var hours = parseInt((countdown/(1000*60*60))%24)
      var minutes = parseInt((countdown/(1000*60))%60)
      var seconds = parseInt((countdown/1000)%60)
      console.log('\nRefreshing fees in ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds')
    }
    setTimeout(function() {
      exchange['setFees'].apply(exchange, args)
    }, countdown)
  }

  var orders = {}
  var exchange = {
    name: 'cexio',
    historyScan: 'forward',
    backfillRateLimit: 0,
    makerFee: 0.16,
    takerFee: 0.25,
    dynamicFees: true,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var args
      if (typeof opts.from === 'undefined' && opts.product_id === 'BTC-USD') {
        args = 2000000
      } else {
        args = opts.from
      }
      var client = publicClient()
      var pair = joinProduct(opts.product_id)
      client.trade_history(pair, args, function (err, body) {
        if (so.debug && typeof body === 'string' && body.match(/error/)) console.log(('\ngetTrades ' + body).red)
        if (err || (typeof body === 'string' && body.match(/error/))) return retry('getTrades', func_args)
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
        if (so.debug && typeof body === 'string' && body.match(/error/)) console.log(('\ngetBalance ' + body).red)
        if (err || (typeof body === 'string' && body.match(/error/))) return retry('getBalance', func_args)
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
        if (so.debug && typeof body === 'string' && body.match(/error/)) console.log(('\ngetQuote ' + body).red)
        if (err || (typeof body === 'string' && body.match(/error/))) return retry('getQuote', func_args)
        cb(null, { bid: String(body.bid), ask: String(body.ask) })
      })
    },

    cancelOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.cancel_order(opts.order_id, function (err, body) {
        if (so.debug && typeof body === 'string' && body.match(/error/)) console.log(('\ncancelOrder ' + body).red)
        if (err || (typeof body === 'string' && body.match(/error/) && body !== 'error: Error: Order not found')) return retry('cancelOrder', func_args)
        cb()
      })
    },

    trade: function (action, opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      var pair = joinProduct(opts.product_id)
      if (opts.order_type === 'taker') {
        delete opts.price
        delete opts.post_only
        if (action === 'buy') {
          opts.size = n(opts.size).multiply(opts.orig_price).value() // CEXIO estimates asset size and uses free currency to performe margin buy
        }
        opts.type = 'market'
      }
      client.place_order(pair, action, opts.size, opts.price, opts.type, function (err, body) {
        if (so.debug && typeof body === 'string' && body.match(/error/)) console.log(('\ntrade ' + body).red)
        if (err || (typeof body === 'string' && body.match(/error/) && body !== 'error: Error: Place order error: Insufficient funds.')) return retry('trade', func_args)
        if (body === 'error: Error: Place order error: Insufficient funds.') {
          var order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }
        if (err) return retry('trade', func_args, err)
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

    buy: function (opts, cb) {
      exchange.trade('buy', opts, cb)
    },

    sell: function (opts, cb) {
      exchange.trade('sell', opts, cb)
    },

    getOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var order = orders['~' + opts.order_id]
      var client = authedClient()
      client.get_order_details(opts.order_id, function (err, body) {
        if (so.debug && typeof body === 'string' && body.match(/error/)) console.log(('\ngetOrder ' + body).red)
        if (err || (typeof body === 'string' && body.match(/error/))) return retry('getOrder', func_args)
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

    setFees: function(opts) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.get_my_fee(function (err, body) {
        if (err || (typeof body === 'string' && body.match(/error/))) {
          if (so.debug) {
            console.log(('\nsetFees ' + body + ' - using fixed fees!').red)
          }
          return retry('setFees', func_args)
        } else {
          var pair = opts.asset + ':' + opts.currency
          var makerFee = (parseFloat(body[pair].buyMaker) + parseFloat(body[pair].sellMaker)) / 2
          var takerFee = (parseFloat(body[pair].buy) + parseFloat(body[pair].sell)) / 2
          if (exchange.makerFee != makerFee) {
            if (so.debug) console.log('\nMaker fee changed: ' + exchange.makerFee + '% -> ' + makerFee + '%')
            exchange.makerFee = makerFee
          }
          if (exchange.takerFee != takerFee) {
            if (so.debug) console.log('\nTaker fee changed: ' + exchange.takerFee + '% -> ' + takerFee + '%')
            exchange.takerFee = takerFee
          }
        }
        return refreshFees(func_args)
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return trade.trade_id
    }
  }
  return exchange
}
