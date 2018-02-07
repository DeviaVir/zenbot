const ccxt = require ('ccxt'),
  path = require('path')

module.exports = function container(conf) {

  var public_client, authed_client

  function publicClient() {
    if (!public_client) public_client = new ccxt.therock ({'apiKey': '', 'secret': '' })
    return public_client
  }

  function authedClient() {
    if (!authed_client) {
      if (!conf.therock || !conf.therock.key || !conf.therock.key === 'YOUR-API-KEY') {
        throw new Error('please configure your TheRockTrading credentials in ' + path.resolve(__dirname, 'conf.js'))
      }

      authed_client = new ccxt.therock ({ 'apiKey': conf.therock.key,'secret': conf.therock.secret })
    }
    return authed_client
  }


  function joinProduct(product_id) {
    return product_id.split('-')[0] + product_id.split('-')[1]
  }

  function retry(method, args) {
    if (method !== 'getTrades') {
      console.error(('\n TheRockTrading API is down! unable to call ' + method + ', retrying in 10s').red)
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, 20000)
  }

  var orders = {}

  var exchange = {
    name: 'therock',
    historyScan: 'forward',
    makerFee: 0.3,
    takerFee: 0.2,

    getProducts: function () {
      return require('./products.json')
    },

    getTradesTheRock: function (args, cb, trades=[]) {
      let _this = this
      let client = publicClient()
      let market = client.market(args.id)
      client.request(
        `funds/${args.id}/trades?after=${args.after}&per_page=${args.per_page}&page=${args.page}&id=${args.id}`,
        'public', 'GET', args
      ).then(function(response) {
        console.log(`Fetched page ${args.page} of ${response['meta'].last.page}`)
        trades = trades.concat(response['trades'])
        if (response['meta'].current.page < response['meta'].last.page) {
          args['page'] = response['meta'].next.page
          return _this.getTradesTheRock(args, cb, trades)
        }
        else {
          return cb(client.parseTrades (trades, market))
        }
      })
    },

    getTrades: function (opts, cb) {
      var args = {
        id: joinProduct(opts.product_id),
        per_page: 200,
        page: 1
      }
      if (opts.from) {
        args.after = new Date(opts.from).toISOString()
      }
      if(opts.to){
        args.before = new Date(opts.to).toISOString()
      }

      this.getTradesTheRock(args, function(result) {
        var trades = result.map(function(trade) {
          return {
            trade_id: trade.id,
            time: trade.timestamp,
            size: parseFloat(trade.amount),
            price: parseFloat(trade.price),
            side: trade.side,
          }
        })
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.fetchBalance().then(result =>{
        var balance = {asset: 0, currency: 0}
        Object.keys(result).forEach(function(key){
          if(key === opts.currency){
            balance.currency = result[key].free
            balance.currency_hold = result[key].used
          }
          if(key === opts.asset){
            balance.asset = result[key].free
            balance.asset_hold = result[key].used
          }
          cb(null, balance)
        })
      })
        .catch(function (error) {
          console.error('An error occurred', error)
          return retry('getBalance', func_args)
        })
    },


    getQuote: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = publicClient()
      client.fetchTicker({id: joinProduct(opts.product_id)}).then(result =>{
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
        delete opts.price
        delete opts.post_only
        opts.type = 'market'
      }
      opts.side = 'buy'
      delete opts.order_type
      client.createOrder(opts.market, opts.type, opts.side, opts.amount, opts.price, opts).then(result =>{
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
        delete opts.price
        delete opts.post_only
        opts.type = 'market'
      }
      opts.side = 'sell'
      delete opts.order_type
      client.createOrder(opts.market, opts.type, opts.side, opts.amount, opts.price, opts).then(result =>{
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

    getOrder: function (opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.getOrder(opts.order_id, function (err, resp, body) {

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

    getCursor: function (trade) {
      return (trade.time || trade)
    },
  }
  return exchange
}
