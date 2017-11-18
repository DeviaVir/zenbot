var bittrex_authed = require('node.bittrex.api'),
    bittrex_public = require('node.bittrex.api'),
    path = require('path'),
    moment = require('moment'),
    n = require('numbro'),
    colors = require('colors')


/**
 ** Bittrex API
 ** 
 ** please note: unfortunately getmarkethistory does not work based on time
 ** this means that we cannot do any backfilles, but paper trading should be fine
 ** https://github.com/n0mad01/node.bittrex.api/issues/17
 **
 **/
module.exports = function container(get, set, clear) {
  var c = get('conf')
  var recoverableErrors = new RegExp(/(ESOCKETTIMEDOUT|ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|Invalid nonce|Rate limit exceeded)/)
  var shownWarning = false

  bittrex_authed.options({
    'apikey' : c.bittrex.key.trim(),
    'apisecret' : c.bittrex.secret.trim(),
    'stream': false,
    'cleartext': false,
    'verbose': false
  })

  function joinProduct(product_id) {
    return product_id.split('-')[1] + '-' + product_id.split('-')[0]
  }

  function retry(method, args, error) {
    if (error.message.match(/Rate limit exceeded/)) {
      var timeout = 10000
    } else {
      var timeout = 2500
    }

    console.error(('\Bittrex API error - unable to call ' + method + ' (' + error.message + '), retrying in ' + timeout / 1000 + 's').red)
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, timeout)
  }

  var orders = {}

  var exchange = {
    name: 'bittrex',
    historyScan: 'forward',
    makerFee: 0.25,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var args = {
        market: joinProduct(opts.product_id)
      }

      bittrex_public.getmarkethistory(args, function( data ) {
        if (!shownWarning) {
          console.log('please note: the bittrex api does not support backfilling (trade/paper only).')
          console.log('please note: make sure to set the --period=1m to make sure data for trade/paper is fetched.')
          shownWarning = true
        }
        if (typeof data !== 'object') {
          console.log('bittrex API (getmarkethistory) had an abnormal response, quitting.')
          return cb(null, [])
        }

        if(!data.success) {
          if (data.message && data.message.match(recoverableErrors)) {
            return retry('getTrades', func_args, data.message)
          }
          console.log(data.message)
          return cb(null, [])
        }

        var trades = []
        try {
          Object.keys(data.result).forEach(function (i) {
            var trade = data.result[i]
            if (isNaN(opts.from) || moment(trade.TimeStamp).valueOf() > opts.from) {
              trades.push({
                trade_id: trade.Id,
                time: moment(trade.TimeStamp).valueOf(),
                size: parseFloat(trade.Quantity),
                price: parseFloat(trade.Price),
                side: trade.OrderType == 'BUY' ? 'buy' : 'sell'
              })
            }
          })
        } catch (e) {
          return retry('getTrades', func_args, {message: 'Error:  ' + e});
        }
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var args = [].slice.call(arguments)

      bittrex_authed.getbalances(function( data ) {
        if (typeof data !== 'object') {
          console.log('bittrex API (getbalances) had an abnormal response, quitting.')
          return cb(null, [])
        }

        if(!data.success) {
          if (data.message && data.message.match(recoverableErrors)) {
            return retry('getBalance', args, data.message)
          }
          console.log(data.message)
          return cb(null, [])
        }

        var balance = {
          asset: 0,
          currency: 0
        }

        Object.keys(data.result).forEach(function (i) {
          var _balance = data.result[i]
          if(opts.last_signal === 'buy') {
            if (_balance['Currency'] === opts.currency.toUpperCase()) {
              balance.currency = n(_balance.Available).format('0.00000000'),
                balance.currency_hold = 0
            }
            if (_balance['Currency'] === opts.asset.toUpperCase()) {
              balance.asset = n(_balance.Available).format('0.00000000'),
                balance.asset_hold = 0
            }
          } else {
            if (_balance['Currency'] === opts.asset.toUpperCase()) {
              balance.asset = n(_balance.Available).format('0.00000000'),
                balance.asset_hold = 0
            }
            if (_balance['Currency'] === opts.currency.toUpperCase()) {
              balance.currency = n(_balance.Available).format('0.00000000'),
                balance.currency_hold = 0
            }
          }
        })
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
      var args = {
        market: joinProduct(opts.product_id)
      }
      bittrex_public.getticker(args, function( data ) {
        if (typeof data !== 'object') {
          console.log('bittrex API (getticker) had an abnormal response, quitting.')
          return cb(null, [])
        }

        if(!data.success) {
          if (data.message && data.message.match(recoverableErrors)) {
            return retry('getQuote', args, data.message)
          }
          console.log(data.message)
          return cb(null, [])
        }

        cb(null, {
          bid: data.result.Bid,
          ask: data.result.Ask
        })
      })
    },

    cancelOrder: function (opts, cb) {
      var args = [].slice.call(arguments)
      bittrex_authed.cancel({
        uuid: opts.order_id
      }, function( data ) {
        if (typeof data !== 'object') {
          console.log('bittrex API (cancel) had an abnormal response, quitting.')
          return cb(null, [])
        }

        if('error' in data || !data.success) {
          console.log(data.error)
          console.log(data.message)
          return cb(null, [])
        }

        cb(null)
      })
    },

    trade: function (type, opts, cb) {
      var args = [].slice.call(arguments)

      var params = {
        market: joinProduct(opts.product_id),
        quantity: opts.size,
        rate: opts.price
      }

      if(!'order_type' in opts || !opts.order_type) {
        opts.order_type = 'maker'
      }

      var fn = function(data) {
        if (typeof data !== 'object') {
          console.log('bittrex API (trade) had an abnormal response, quitting.')
          return cb(null, [])
        }

        if(!data.success) {
          if (data.message && data.message.match(recoverableErrors)) {
            return retry('trade', args, data.message)
          }
          console.log(data.message)
          return cb(null, [])
        }

        var order = {
          id: data && data.result ? data.result.uuid : null,
          status: 'open',
          price: opts.price,
          size: opts.size,
          post_only: !!opts.post_only,
          created_at: new Date().getTime(),
          filled_size: '0',
          ordertype: opts.order_type
        }

        orders['~' + data.result.uuid] = order
        cb(null, order)
      }

      if (type === 'buy') {
        if (opts.order_type === 'maker') {
          bittrex_authed.buylimit(params, fn)
        }
        if (opts.order_type === 'taker') {
          bittrex_authed.buymarket(params, fn)
        }
      } 
      if (type === 'sell') {
        if (opts.order_type === 'maker') {
          bittrex_authed.selllimit(params, fn)
        }
        if (opts.order_type === 'taker') {
          bittrex_authed.sellmarket(params, fn)
        }
      }
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
      var params = {
        uuid: opts.order_id
      }
      bittrex_authed.getorder(params, function (data) {
        if (typeof data !== 'object') {
          console.log('bittrex API (getorder) had an abnormal response, quitting.')
          return cb(null, [])
        }

        if(!data.success) {
          if (data.message && data.message.match(recoverableErrors)) {
            return retry('getOrder', args, data.message)
          }
          console.log(data.message)
          return cb(null, [])
        }

        var orderData = data.result

        if (!orderData) {
          return cb('Order not found')
        }

        if (orderData.IsOpen === false) {
          order.status = 'done'
          order.done_at = new Date().getTime()
          order.filled_size = parseFloat(orderData.Quantity) - parseFloat(orderData.QuantityRemaining)
          return cb(null, order)
        }

        cb(null, order)
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return (trade.time || trade);
    }
  }
  return exchange
}
