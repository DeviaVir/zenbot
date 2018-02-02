var bittrex_authed = require('node-bittrex-api'),
  bittrex_public = require('node-bittrex-api'),
  n = require('numbro')



/**
 ** Bittrex API
 ** 
 ** please note: unfortunately getmarkethistory does not work based on time
 ** this means that we cannot do any backfilles, but paper trading should be fine
 ** https://github.com/n0mad01/node.bittrex.api/issues/17
 **
 **/
module.exports = function container(get, set, clear) {
  let c = get('conf')
  let recoverableErrors = new RegExp(/(ESOCKETTIMEOUT|ESOCKETTIMEDOUT|ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|Invalid nonce|Rate limit exceeded|URL request error)/)
 
  let shownWarning = false
  let fistRun = true


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
    var timeout = 2500
    if (error)
      if (error.message)
        if (error.message.match(/Rate limit exceeded/)) {
          timeout = 10000
        } 
    // console.error(('\nBittrex API error - unable to call ' + method + ' (' + error.message + '), retrying in ' + timeout / 1000 + 's').red)
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, timeout)
    return false
  }

  function handleErrors(command, err, data, args, callback) {

    //console.log(JSON.stringify(err))
  // console.log(JSON.stringify(data)) 
    if (err)
    {
      //console.log('API Error')
  
      if (err.message && err.message.match(recoverableErrors)) {
  
        return retry(command, args, err)
      }
      return callback(err, [])     
    }
   
    
    if (typeof data !== 'object') {
      console.log(`bittrex API ${command} had an abnormal response, quitting.`)
      return callback(null, [])
    }

    // generic error handler data was null and err was null
    if (data == null)
    {
      return retry(command, args, err)
    }

    // specific handlers
    if ((command == 'getQuote' || command == 'getTrades') && data.result == null )
    {

      return retry(command, args, data)
    }

    if(!data.success) {
      if (data.message && data.message.match(recoverableErrors)) {
        return retry(command, args, data.message)
      }
      // console.log(data.message)
      return callback(null, [])
    }


    return true
  }


  var orders = {}

  var exchange = {
    name: 'bittrex',
    historyScan: 'forward',
    makerFee: 0.25,
    takerFee: 0.25,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function  (opts, cb) {

    

      var func_args = [].slice.call(arguments)
      var args = {
        market:joinProduct(opts.product_id),
        marketName: joinProduct(opts.product_id),
        tickInterval: 'oneMin'
      }

      //accomplish back trades using 2 calls.
      //ticks and getMarket and create a hybrid result.
      var trades = []
      // first run do the full deal.  
      // 2nd run.  only return the last trades
      if (fistRun)
      {
        bittrex_public.getticks(args,  function( data, err) {
          let res = handleErrors('getTrades', err, data, func_args, cb)


      
          if (!shownWarning) {
            console.log('Please note: the bittrex api does not support backfilling directly.')
            console.log('Backfill is indirectly supported thru the use of a hybrid system that combines a low resolution long term market of about 10 days and a short term high res market of the last 1-5 minutes.')
            console.log('Please note: make sure to set the --period_length=1m to make sure data for trade/paper is fetched.')
            shownWarning = true
          }



          if (res)
          {
            let lastVal = 0
            for (const key in Object.keys(data.result)) {
      
              var trade = data.result[key]
              if (isNaN(opts.from) || new Date(trade.T).getTime() > opts.from) {
                let buySell = 'sell'
                //todo: unsure about the >. if the price is greater than the last one should this one be a buy or sell. figure it out. 
                if (parseFloat(trade.C) > lastVal) buySell = 'buy'
                trades.push({
                  trade_id: trade.T,
                  time: new Date(trade.T).getTime(),
                  size: parseFloat(trade.V),
                  price: parseFloat(trade.C),
                  side: buySell
                })
                lastVal = parseFloat(trade.C)
              }
            }


      
            bittrex_public.getmarkethistory(args,  function( data, err) {
              let res2 = handleErrors('getTrades', err, data, func_args, cb)
              
              if (res2)
              {
                for (const key in Object.keys(data.result)) {
                  var trade = data.result[key]
                  if (isNaN(opts.from) || new Date(trade.TimeStamp).getTime() > opts.from) {
             
                    trades.push({
                      trade_id: trade.Id,
                      time: new Date(trade.TimeStamp).getTime(),
                      size: parseFloat(trade.Quantity),
                      price: parseFloat(trade.Price),
                      side: trade.OrderType || trade.OrderType == 'SELL' ? 'sell': 'buy'
                    })
                  }
                }
                fistRun = false
                cb(null, trades) 
                
              }
            })
       
          }
        })
      } else
      {
        bittrex_public.getmarkethistory(args,  function( data, err) {
          let res2 = handleErrors('getTrades', err, data, func_args, cb)
        
          if (res2)
          {
            for (const key in Object.keys(data.result)) {
              var trade = data.result[key]
              if (isNaN(opts.from) || new Date(trade.TimeStamp).getTime() > opts.from) {
       
                trades.push({
                  trade_id: trade.Id,
                  time: new Date(trade.TimeStamp).getTime(),
                  size: parseFloat(trade.Quantity),
                  price: parseFloat(trade.Price),
                  side: trade.OrderType || trade.OrderType == 'SELL' ? 'sell': 'buy'
                })
              }
          
            }

           
            cb(null, trades)
        
          }
        })
      }
 
    },

    getBalance: function (opts, cb) {
      var func_args = [].slice.call(arguments)

      bittrex_authed.getbalances(function( data,err ) {
       
        let res = handleErrors('getBalance', err, data, func_args, cb)

        var balance = {
          asset: 0,
          currency: 0
        }
        if (res)
        {
          for (const key in data.result) {
            var _balance = data.result[key]
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
          }
          cb(null, balance)
        }
      
      })
    },

    getQuote: function (opts, cb) {
      if (opts == null) return
      if (opts.product_id == null) return
      var func_args = [].slice.call(arguments)
      var args = {
        market: joinProduct(opts.product_id)
      }
      bittrex_public.getticker(args, function( data, err ) {
        let res = handleErrors('getQuote', err, data, func_args, cb)
        if (res)
          cb(null, {
            bid: data.result.Bid,
            ask: data.result.Ask
          })
      })
    },

    cancelOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      let args = {
        uuid: opts.order_id
      }
      bittrex_authed.cancel(args, function( data,err ) {
       
        let res = handleErrors('cancelOrder', err, data, func_args, cb)
       
       
        if (res) {
          cb(null)
        }
      })
    },

    trade: function (type, opts, cb) {
      var func_args = [].slice.call(arguments)

      var params = {
        market: joinProduct(opts.product_id),
        quantity: opts.size,
        rate: opts.price
      }

      if(!('order_type' in opts) || !opts.order_type) {
        opts.order_type = 'maker'
      }

      var fn = function(data,err) {
        if (err != null )
        {
          if (data == null)
          {
            data = {}
            data.message = err.message
            data.success = err.success
            data.result = err.result
          } 
          console.log('API Error')
          console.log(JSON.stringify(err))
          if (err.message && err.message.match(recoverableErrors)) {
            return retry('trade', func_args, err.message)
          }
        }
        if (err && err.message)
        {
          if (err.message =='MIN_TRADE_REQUIREMENT_NOT_MET')
          {
            let returnResult = {
              reject_reason:'balance',
              status:'rejected'
            }
            return cb(null, returnResult)
          }
        }
        
        if (typeof data !== 'object') {
          return cb(null, {})
        }
      
        if(!data.success) {
          if (data.message && data.message.match(recoverableErrors)) {
            return retry('trade', func_args, data.message)
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
      var func_args = [].slice.call(arguments)
      var order = orders['~' + opts.order_id]
      if (!order) return cb(new Error('order not found in cache'))
      var params = {
        uuid: opts.order_id
      }
      bittrex_authed.getorder(params, function (data,err) {
        let res = handleErrors('getOrder', err, data, func_args, cb)
      
        if (res)
        {
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
        }
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return (trade.time || trade)
    }
  }
  return exchange
}
