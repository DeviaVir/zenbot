const ccxt = require('ccxt')
const path = require('path')


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
    var timeout = 5000
    if (method == 'getOrder') {
      // it can take up to 30 seconds for hitbtc to update with an order change.
      if (err)    
        if (err.message.match(/not found/)) {
          timeout = 7000
        }
    }

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


  var firstRun = true
  var exchange = {
    name: 'hitbtc',
    historyScan: 'forward',
    makerFee:  -0.01,
    takerFee: 0.1,

    getProducts: function () {
      if (firstRun)
      {
        firstRun = false
        var client = publicClient()
        this.makerFee = client.fees.trading.maker * 100 
        this.takerFee = client.fees.trading.taker * 100
      
      }
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      {
        client.fetchTrades(joinProduct(opts.product_id),opts.from)
          .then(result => {
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
            return retry('getTrades', func_args,error)
          })
      }
    },

    getBalance: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.fetchBalance()
        .then(result => {
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
          return retry('getBalance', func_args,error)
        })
    },

    getQuote: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      client.fetchTicker(joinProduct(opts.product_id))
        .then(result => {
          cb(null, { bid: result.bid, ask: result.ask })
        })
        .catch(function (error) {
          return retry('getQuote', func_args,error)
        })
    },

    cancelOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.cancelOrder(opts.order_id,joinProduct(opts.product_id) )
        .then( (result) => {
          cb(result)
        })
        .catch(function (error) {
          return retry('cancelOrder', func_args,error)
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
     
      client.createOrder( callParams.symbol, callParams.type, callParams.side, callParams.quantity, callParams.price)
        .then(result => {
       
          cb(null, result)
        }).catch(function (error) {
          if (error.message.match(/Insufficient funds/)) 
          {
            let order = {
              status: 'rejected',
              reject_reason: 'balance'
            }
            return cb(null, order)
          }
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
      
      client.createOrder(callParams.symbol, callParams.type, callParams.side, callParams.quantity, callParams.price)
        .then(result => {
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
         
       
          return cb(null, order)
        }).catch(function (error) {
          if (error.message.match(/Insufficient funds/)) 
          {
            let order = {
              status: 'rejected',
              reject_reason: 'balance'
            }
            return cb(null, order)
          }
          return retry('sell', func_args, error)
        })
    },

    getOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()

      client.fetchOrder(opts.order_id, joinProduct(opts.product_id),{wait:100000})
        .then( result => {
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

          if (result.status == 'done' || result.status == 'closed') {
            result.status = 'done'
            result.done_at = new Date().getTime()
            result.filled_size = parseFloat(result.amount) - parseFloat(result.remaining)
            return cb(null, result)
          }

          return cb(null,r)
        }).catch(function (error) {
          return retry('getOrder', func_args,error)
        }) 
    },

    getCursor: function (trade) {
      return (trade.time || trade)
    }
  }
  return exchange
}
