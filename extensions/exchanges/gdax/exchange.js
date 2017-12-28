var Gdax = require('gdax')

module.exports = function container (get, set, clear) {
  var c = get('conf')

  var public_client = {}, authed_client, websocket_client = {}, websocket_cache = {}

  function publicClient (product_id) {
    if (!public_client[product_id]) {
      websocketClient(product_id)
      public_client[product_id] = new Gdax.PublicClient(product_id, c.gdax.apiURI)
    }
    return public_client[product_id]
  }

  function websocketClient (product_id) {
    if (!websocket_client[product_id]) {
      // OrderbookSync extends WebsocketClient and subscribes to the 'full' channel, so we can use it like one
      var auth = null
      try {
        auth = authedClient()
      } catch(e){}
      websocket_client[product_id] = new Gdax.OrderbookSync([product_id], c.gdax.apiURI, c.gdax.websocketURI, auth)
      // initialize a cache for the websocket connection
      websocket_cache[product_id] = {
        trades: [],
        trade_ids: []
      }
      websocket_client[product_id].on('open', () => {
        console.log('websocket connection to '+product_id+' opened')
      })
      websocket_client[product_id].on('message', (message) => {
        switch (message.type) {
        case 'match':
          handleTrade(message, product_id)
          break
        default:
          break
        }
      })
      websocket_client[product_id].on('error', (err) => {
        console.log(err)
      })
      websocket_client[product_id].on('close', () => {
        console.error('websocket connection to '+product_id+' closed, attempting reconnect')
        websocket_client[product_id].connect()
      })
    }
  }

  function authedClient () {
    if (!authed_client) {
      if (!c.gdax || !c.gdax.key || c.gdax.key === 'YOUR-API-KEY') {
        throw new Error('please configure your GDAX credentials in conf.js')
      }
      authed_client = new Gdax.AuthenticatedClient(c.gdax.key, c.gdax.b64secret, c.gdax.passphrase, c.gdax.apiURI)
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

  function handleTrade(trade, product_id) {
    var cache = websocket_cache[product_id]
    cache.trades.push(trade)
    cache.trade_ids.push(trade.trade_id)
  }

  // TODO: this contains open orders and gets updated on buy/sell/getOrder
  // should maintain a list of ID's and keep this up to date from the websocket feed's 
  // 'done'/'change'/'match' messages and use this as a cache for `getOrder` below
  var orders = {}

  var exchange = {
    name: 'gdax',
    historyScan: 'backward',
    makerFee: 0,
    takerFee: 0.3,

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
      client.getProductTrades(args, function (err, resp, body) {
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
      if(websocket_client[opts.product_id] && websocket_client[opts.product_id].books) {
        var book = websocket_client[opts.product_id].books[opts.product_id]
        var state = book.state()
        var asks = state.asks
        var bids = state.bids
        if(bids.length && asks.length){
          // price is a `num` arbitrary precision number and needs to be toString()ed and parseFloat()ed 
          var best_bid = parseFloat(bids[0].price.toString())
          var best_ask = parseFloat(asks[0].price.toString())
          if(best_bid && best_ask){
            cb(null, {bid: best_bid, ask: best_ask})
            return
          }
        }
      }
      var func_args = [].slice.call(arguments)
      var client = publicClient(opts.product_id)
      client.getProductTicker(function (err, resp, body) {
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
      var func_args = [].slice.call(arguments)
      var client = authedClient()
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
