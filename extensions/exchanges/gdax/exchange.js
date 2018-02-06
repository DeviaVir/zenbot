var Gdax = require('gdax'),
  minimist = require('minimist')

module.exports = function gdax (conf) {
  var so = minimist(process.argv)
  var public_client = {}, authed_client, websocket_client = {}, websocket_cache = {}

  function publicClient (product_id) {
    if (!public_client[product_id]) {
      websocketClient(product_id)
      public_client[product_id] = new Gdax.PublicClient(conf.gdax.apiURI)
    }
    return public_client[product_id]
  }

  function websocketClient (product_id) {
    if (!websocket_client[product_id]) {
      var auth = null
      var client_state = {}
      auth = {
        key: conf.gdax.key, 
        secret: conf.gdax.b64secret, 
        passphrase: conf.gdax.passphrase
      }
      websocket_client[product_id] = new Gdax.WebsocketClient([product_id], conf.gdax.websocketURI, auth, {channels: ['matches', 'user', 'ticker']})
      // initialize a cache for the websocket connection
      websocket_cache[product_id] = {
        trades: [],
        trade_ids: [],
        orders: {},
        ticker: {}
      }

      websocket_client[product_id].on('open', () => {
        if(so.debug) console.log('websocket connection to '+product_id+' opened') 
      })

      websocket_client[product_id].on('message', (message) => {
        // all messages with user_id are related to trades for current authenticated user
        if(message.user_id){
          switch (message.type) {
          case 'open':
            handleOrderOpen(message, product_id)
            break
          case 'done':
            handleOrderDone(message, product_id)
            break
          case 'change':
            handleOrderChange(message, product_id)
            break
          case 'match':
            handleOrderMatch(message, product_id)
            break
          default:
            break
          }
        }
        switch (message.type) {
        case 'open':
          break
        case 'done':
          break
        case 'change':
          break
        case 'match':
          handleTrade(message, product_id)
          break
        case 'ticker':
          handleTicker(message, product_id)
          break
        default:
          break
        }
      })

      websocket_client[product_id].on('error', (err) => {
        client_state.errored = true
        if(so.debug) console.error('websocket error: ', err, 'restarting websocket connection')
        websocket_client[product_id].disconnect()
        websocket_client[product_id] = null
        websocket_cache[product_id] = null
        websocketClient(product_id)
      })
      
      websocket_client[product_id].on('close', () => {
        if(client_state.errored){
          client_state.errored = false
          return
        }
        if(so.debug) console.error('websocket connection to '+product_id+' closed, attempting reconnect')
        websocket_client[product_id] = null
        websocket_client[product_id] = websocketClient(product_id)
      })
    }
    return websocket_client[product_id]
  }

  function authedClient () {
    if (!authed_client) {
      if (!conf.gdax || !conf.gdax.key || conf.gdax.key === 'YOUR-API-KEY') {
        throw new Error('please configure your GDAX credentials in conf.js')
      }
      authed_client = new Gdax.AuthenticatedClient(conf.gdax.key, conf.gdax.b64secret, conf.gdax.passphrase, conf.gdax.apiURI)
    }
    return authed_client
  }

  function statusErr (resp, body) {
    if (resp.statusCode !== 200) {
      var err = new Error('non-200 status: ' + resp.statusCode)
      err.code = 'HTTP_STATUS'
      err.body = body
      return err
    }
  }

  function retry (method, args, err) {
    if (method !== 'getTrades') {
      console.error(('\nGDAX API is down! unable to call ' + method + ', retrying in 10s').red)
      if (err) console.error(err)
      console.error(args.slice(0, -1))
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, 10000)
  }

  function handleOrderOpen(update, product_id) {
    websocket_cache[product_id].orders['~'+update.order_id] = {
      id: update.order_id,
      price: update.price,
      size: update.remaining_size,
      product_id: update.product_id,
      side: update.side,
      status: 'open',
      settled: false,
      filled_size: 0
    }
  }

  function handleOrderDone(update, product_id) {
    var cached_order = websocket_cache[product_id].orders['~'+update.order_id]
    if(cached_order){
      cached_order.status = 'done'
      cached_order.done_at = update.time
      cached_order.done_reason = update.reason,
      cached_order.settled = true
    }
  }

  function handleOrderChange(update, product_id) {
    var cached_order = websocket_cache[product_id].orders['~'+update.order_id]
    if(cached_order && update.new_size){
      cached_order.size = update.new_size
    }
  }

  function handleOrderMatch(update, product_id) {
    var cached_order = websocket_cache[product_id].orders['~'+update.maker_order_id] || websocket_cache[product_id].orders['~'+update.taker_order_id]
    if(cached_order){
      cached_order.price = update.price
      cached_order.filled_size = (parseFloat(cached_order.filled_size) + update.size).toString()
    }
  }

  function handleTrade(trade, product_id) {
    var cache = websocket_cache[product_id]
    cache.trades.push(trade)
    cache.trade_ids.push(trade.trade_id)
  }

  function handleTicker(ticker, product_id) {
    websocket_cache[product_id].ticker = ticker
  }

  var orders = {}

  var exchange = {
    name: 'gdax',
    historyScan: 'backward',
    makerFee: 0,
    takerFee: 0.3,
    backfillRateLimit: 335,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments)
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
      // check for locally cached trades from the websocket feed
      var cache = websocket_cache[opts.product_id]
      var max_trade_id = cache.trade_ids.reduce(function(a, b) {
        return Math.max(a, b)
      }, -1)
      if (opts.from && max_trade_id >= opts.from) {
        var fromIndex = cache.trades.findIndex((value)=> {return value.trade_id == opts.from})
        var newTrades = cache.trades.slice(fromIndex + 1)
        newTrades = newTrades.map(function (trade) {
          return {
            trade_id: trade.trade_id,
            time: new Date(trade.time).getTime(),
            size: Number(trade.size),
            price: Number(trade.price),
            side: trade.side
          }
        })
        newTrades.reverse()
        cb(null, newTrades)
        // trim cache
        cache.trades = cache.trades.slice(fromIndex)
        cache.trade_ids = cache.trade_ids.slice(fromIndex)
        return
      }
      if(so.debug) console.log('getproducttrades call')
      client.getProductTrades(opts.product_id, args, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return retry('getTrades', func_args, err)
        var trades = body.map(function (trade) {
          return {
            trade_id: trade.trade_id,
            time: new Date(trade.time).getTime(),
            size: Number(trade.size),
            price: Number(trade.price),
            side: trade.side
          }
        })
        trades.reverse()
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      if(so.debug) console.log('getaccounts call')
      client.getAccounts(function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return retry('getBalance', func_args, err)
        var balance = {asset: 0, currency: 0}
        body.forEach(function (account) {
          if (account.currency === opts.currency) {
            balance.currency = account.balance
            balance.currency_hold = account.hold
          }
          else if (account.currency === opts.asset) {
            balance.asset = account.balance
            balance.asset_hold = account.hold
          }
        })
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
      // check websocket cache first
      if(websocket_cache[opts.product_id]) {
        var ticker = websocket_cache[opts.product_id].ticker
        if(ticker.best_ask && ticker.best_bid){
          cb(null, {bid: ticker.best_bid, ask: ticker.best_ask})
          return
        }
      }
      var func_args = [].slice.call(arguments)
      var client = publicClient(opts.product_id)
      if(so.debug) console.log('getproductticker call')
      client.getProductTicker(opts.product_id, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return retry('getQuote', func_args, err)
        if (body.bid || body.ask)
          cb(null, {bid: body.bid, ask: body.ask})
        else
          cb({code: 'ENOTFOUND', body: opts.product_id + ' has no liquidity to quote'})
      })
    },

    cancelOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      if(so.debug) console.log('cancelorder call')
      client.cancelOrder(opts.order_id, function (err, resp, body) {
        if (body && (body.message === 'Order already done' || body.message === 'order not found')) return cb()
        if (!err) err = statusErr(resp, body)
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
        delete opts.price
        delete opts.post_only
        delete opts.cancel_after
        opts.type = 'market'
      }
      else {
        opts.time_in_force = 'GTT'
      }
      delete opts.order_type
      if(so.debug) console.log('buy call')
      client.buy(opts, function (err, resp, body) {
        if (body && body.message === 'Insufficient funds') {
          var order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }
        if (!err) err = statusErr(resp, body)
        if (err) return retry('buy', func_args, err)
        orders['~' + body.id] = body
        cb(null, body)
      })
    },

    sell: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      if (opts.order_type === 'taker') {
        delete opts.price
        delete opts.post_only
        delete opts.cancel_after
        opts.type = 'market'
      }
      else {
        opts.time_in_force = 'GTT'
      }
      delete opts.order_type
      if(so.debug) console.log('sell call')
      client.sell(opts, function (err, resp, body) {
        if (body && body.message === 'Insufficient funds') {
          var order = {
            status: 'rejected',
            reject_reason: 'balance'
          }
          return cb(null, order)
        }
        if (!err) err = statusErr(resp, body)
        if (err) return retry('sell', func_args, err)
        orders['~' + body.id] = body
        cb(null, body)
      })
    },

    getOrder: function (opts, cb) {
      if(websocket_cache[opts.product_id] &&
        websocket_cache[opts.product_id].orders['~'+opts.order_id]){
        cb(null, websocket_cache[opts.product_id].orders['~'+opts.order_id])
        return
      }
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      if(so.debug) console.log('getorder call')
      client.getOrder(opts.order_id, function (err, resp, body) {
        if (!err && resp.statusCode !== 404) err = statusErr(resp, body)
        if (err) return retry('getOrder', func_args, err)
        if (resp.statusCode === 404) {
          // order was cancelled. recall from cache
          body = orders['~' + opts.order_id]
          body.status = 'done'
          body.done_reason = 'canceled'
        }
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
