const ccxt = require('ccxt')
var path = require('path')

module.exports = function container (conf) {
 
  //let recoverableErrors = new RegExp(/(ESOCKETTIMEOUT|ESOCKETTIMEDOUT|ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|Invalid nonce|Rate limit exceeded|URL request error)/)
 
  var public_client, authed_client

  function publicClient () {
    if (!public_client) public_client = new ccxt.hitbtc2({ 'apiKey': '', 'secret': '' })
    return public_client
  }

  function authedClient() {
    if (!authed_client) {
      if (!conf.hitbtc || !conf.hitbtc.key || !conf.hitbtc.key === 'YOUR-API-KEY') {
        throw new Error('please configure your HitBTC credentials in ' + path.resolve(__dirname, 'conf.js'))
      }
      authed_client = new ccxt.hitbtc2({ 'apiKey': conf.hitbtc.key, 'secret': conf.hitbtc.secret })
    }
    return authed_client
  }

  function joinProduct(product_id) {
    return product_id.split('-')[0] + '/' + product_id.split('-')[1]
  }

  function retry (method, args, err) {
    if (method !== 'getTrades') {
      console.error(('\n HitBTC API is down! unable to call ' + method + ', retrying in 5s').red)
    }
    var timeout = 2500
    if (err)
      if (err.message)
        if (err.message.match(/Rate limit exceeded/)) {
          timeout = 10000
        } 
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, timeout)
    return false

  }

  // function handleErrors(command, err, data, args, callback) {

  //   if (err)
  //   {
  //     if (err.message && err.message.match(recoverableErrors)) {
  
  //       return retry(command, args, err)
  //     }
  //     return callback(err, [])     
  //   }
   
    
  //   if (typeof data !== 'object') {
  //     console.log(`bittrex API ${command} had an abnormal response, quitting.`)
  //     return callback(null, [])
  //   }

  //   // generic error handler data was null and err was null
  //   if (data == null)
  //   {
  //     return retry(command, args, err)
  //   }

  //   // specific handlers
  //   if ((command == 'getQuote' || command == 'getTrades') && data.result == null )
  //   {

  //     return retry(command, args, data)
  //   }

  //   if(!data.success) {
  //     if (data.message && data.message.match(recoverableErrors)) {
  //       return retry(command, args, data.message)
  //     }
  //     return callback(null, [])
  //   }


  //   return true
  // }



  var orders = {}

  var exchange = {
    name: 'hitbtc',
    historyScan: 'forward',
    makerFee: -0.01,
    takerFee: 0.1,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      {
        client.fetchTrades(joinProduct(opts.product_id),opts.from,1000).then(result => {
          var trades = result.map(function (trade) {
            return {
              trade_id: trade.timestamp,
              time: trade.timestamp,
              size: parseFloat(trade.amount),
              price: parseFloat(trade.price),
              selector: 'hitbtc.'+opts.product_id,
              side: trade.side
            }
          })

          cb(null, trades)
        })
          .catch(function (error) {
            console.error('An error occurred', error)
            return retry('getTrades', func_args)
          })
      }
    },

    getBalance: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.fetchBalance().then(result => {
        var balance = {asset: 0, currency: 0}
        Object.keys(result).forEach(function (key) {
          if (key === opts.currency) {
            balance.currency = result[key].free
            balance.currency_hold = result[key].used
          }
          if (key === opts.asset) {
            balance.asset = result[key].free
            balance.asset_hold = result[key].used
          }
        })
        cb(null, balance)
      })
        .catch(function (error) {
          console.error('An error occurred', error)
          return retry('getBalance', func_args)
        })
    },

    getQuote: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      client.fetchTicker(joinProduct(opts.product_id)).then(result => {
        cb(null, { bid: result.bid, ask: result.ask })
      })
        .catch(function (error) {
          console.error('An error occurred', error)
          return retry('getQuote', func_args)
        })
    },

    cancelOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.cancelOrder(opts.order_id, function (err, resp, body) {
        if (body && (body.message === 'Order already done' || body.message === 'order not found')) return cb()

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
        opts.type = 'market'
      }
      if (opts.order_type == 'maker') {
        opts.type = 'limit'
      }

      opts.side = 'buy'

      let callParams = {
        symbol : joinProduct(opts.product_id),
        type : opts.type,
        side: 'buy', 
        quantity: opts.size, 
        price: opts.price
      }
     
      client.createOrder( callParams.symbol, callParams.type, callParams.side, callParams.quantity, callParams.price).then(result => {
        if (result && result.message === 'Insufficient funds') {
          var order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }

        orders['~' + result.id] = result
        cb(null, result)
      }).catch(function (error) {
        console.error('An error occurred', error)
        return retry('buy', func_args)
      })
    },

    sell: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      if (opts.order_type === 'taker') {
        opts.type = 'market'
      }
      if (opts.order_type == 'maker') {
        opts.type = 'limit'
      }
      opts.side = 'sell'
      let callParams = {
        symbol : joinProduct(opts.product_id),
        type : opts.type,
        side: 'sell', 
        quantity: opts.size, 
        price: opts.price
      }
      client.createOrder(callParams.symbol, callParams.type, callParams.side, callParams.quantity, callParams.price).then(result => {
        let order = {
          id: result ? result.id : null,
          status: 'open',
          price: opts.price,
          size: opts.size,
          post_only: !!opts.post_only,
          created_at: new Date().getTime(),
          filled_size: '0',
          ordertype: opts.order_type
        }
        if (result && result.message === 'Insufficient funds') {
          order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }
       

        orders['~' + result.id] = order
        return cb(null, order)
      }).catch(function (error) {
        console.error('An error occurred', error)
        return retry('sell', func_args)
      })
    },

    getOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.fetchOrder(opts.order_id, opts.product_id,{wait:1000}).then( result => {
        let r = result
        if (result.status === 'canceled') {
          // order was cancelled. recall from cache
    
          return cb({message:'Order not found',desc:'Order cancel or deleted'})
        }
        if (result.status == 'open')
        {
          result.status = 'open'
          result.filled_size = parseFloat(result.amount) - parseFloat(result.remaining)
          return cb(null, result)
        }

        if (result.status == 'done') {
          result.status = 'done'
          result.done_at = new Date().getTime()
          result.filled_size = parseFloat(result.amount) - parseFloat(result.remaining)
          return cb(null, result)
        }

        return cb(null,r)
      }).catch(function (error) {
        console.error('An error occurred', error)
        return retry('getOrder', func_args)
      }) 
    },

    getCursor: function (trade) {
      return (trade.time || trade)
    }
  }
  return exchange
}
