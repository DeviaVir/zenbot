var Bitstamp = require('bitstamp')
  , path = require('path')
  , WebSocket = require('ws')
  // eslint-disable-next-line no-unused-vars
  , n = require('numbro')
  , _ = require('lodash')
const { GridFSBucket } = require('mongodb')

var args = process.argv

const restAPIURL = 'www.bitstamp.net'
const wsURL = 'wss://ws.bitstamp.net'

var wsOpts = {  
  pairOk: false,
  currencyPair: 'btcusd',
  trades: { evType: 'trade', channel: 'live_trades' },
  quotes: { evType: 'data', channel: 'order_book' }
}

// The use of bitstamp-ws  requires that
// Knowledge of the asset/currency pair
// before the first call for a trade
// As zenbot dont returns the currency pair
// before the first trade is requested
// it has been neccessary to get it from
// the command line arguments
parsePairDataFromArgs(args);

function parsePairDataFromArgs(argsData) {
  for (const value of argsData) {
    if (value.toLowerCase().match(/bitstamp/)) {
      var p = value.split('.')[1]
      var prod = p.split('-')[0] + p.split('-')[1]
      var pair = prod.toLowerCase()
      if (!wsOpts.pairOk) {
        wsOpts.trades.channel = 'live_trades_' + pair
        wsOpts.quotes.channel = 'order_book_' + pair
        wsOpts.currencyPair = pair
        wsOpts.pairOk = true
        break
      }
    }
  }
};

function joinProduct(product_id) {
  return product_id.split('-')[0] + product_id.split('-')[1]
}

module.exports = function bitstamp(conf) {  

  function authedClient() {
    if (conf.bitstamp.key && conf.bitstamp.key !== 'YOUR-API-KEY') {
      return new Bitstamp(conf.bitstamp.key, conf.bitstamp.secret, conf.bitstamp.client_id, 5000, restAPIURL)
    }
    throw new Error('\nPlease configure your Bitstamp credentials in ' + path.resolve(__dirname, 'conf.js'))
  }

  //-----------------------------------------------------
  //  The websocket functions
  //

  var Bitstamp_WS = function (confSelector) {
    // if pair data was not received from cli args, parse it from the selector
    if (!wsOpts.pairOk) {
      parsePairDataFromArgs([confSelector])
    }

    // fetch initial order book from REST
    var client = new Bitstamp(null, null, null, 5000, restAPIURL)
    client.order_book(wsOpts.currencyPair, function (err, data) {
      wsquotes = {
        bid: data.bids[0][0],
        ask: data.asks[0][0]
      }
    });

    this.client = new WebSocket(wsURL)

    // bitstamp publishes all data over just 2 channels
    // make sure we only subscribe to each channel once
    this.bound = {
      trade: false,
      data: false
    }

    // subscribe on open
    this.client.on('open', function open() {
      this.subscribe()
    }.bind(this))
  }

  Bitstamp.prototype.tradeDaily = function (direction, market, amount, price, callback) {
    this._post(market, direction, callback, {
      amount: amount,
      price: price,
      daily_order: true
    })
  }

  Bitstamp.prototype.tradeMarket = function (direction, market, amount, callback) {
    this._post(market, direction + '/market', callback, {
      amount: amount,
    })
  }

  var util = require('util')
  var EventEmitter = require('events').EventEmitter
  util.inherits(Bitstamp_WS, EventEmitter)


  Bitstamp_WS.prototype.createSubscribeMessage = function (chanName) {
    return JSON.stringify({
      "event": "bts:subscribe",
      "data": {
        "channel": chanName
      }
    })
  }

  Bitstamp_WS.prototype.bindEvent = function (eventBroadcasts) {
    this.client.on('message', function incoming(data) {
      var parsedData = JSON.parse(data);
      Object.keys(eventBroadcasts).forEach(function (eventName) {
        if (parsedData.event === eventName) {
          var broadcastFunction = eventBroadcasts[eventName]
          broadcastFunction(parsedData.data);
        }
      })
    });
  }

  Bitstamp_WS.prototype.subscribe = function () {
    if (wsOpts.pairOk) {
      var eventFunctions = {};

      this.client.send(this.createSubscribeMessage(wsOpts.trades.channel));
      eventFunctions[wsOpts.trades.evType] = this.broadcast(wsOpts.trades.evType)

      this.client.send(this.createSubscribeMessage(wsOpts.quotes.channel));
      eventFunctions[wsOpts.quotes.evType] = this.broadcast(wsOpts.quotes.evType)

      this.bindEvent(eventFunctions)
    }
  }

  Bitstamp_WS.prototype.broadcast = function (name) {
    if (this.bound[name])
      return function noop() { }
    this.bound[name] = true
    return function (e) {
      this.emit(name, e)
    }.bind(this)
  }
  // Placeholders
  var wsquotes = {}
  var wstrades = []

  var bistampWS = new Bitstamp_WS(conf.selector)

  bistampWS.on('data', function (data) {
    wsquotes = {
      bid: data.bids[0][0],
      ask: data.asks[0][0]
    }
  })

  bistampWS.on('trade', function (data) {
    wstrades.push({
      trade_id: data.id,
      time: Number(data.timestamp) * 1000,
      size: data.amount,
      price: data.price,
      side: data.type === 0 ? 'buy' : 'sell'
    })
  })
  //-----------------------------------------------------

  function statusErr(err, body) {
    if (typeof body === 'undefined') {
      var ret = {}
      var res = err.toString().split(':', 2)
      ret.status = res[1]
      return new Error(ret.status)
    } else {
      if (body.error) {
        return new Error('\nError: ' + body.error)
      } else {
        return body
      }
    }
  }

  function retry(method, wait, args) {
    if (method !== 'getTrades') {
      console.error(('\nBitstamp API is not answering! unable to call ' + method + ', retrying in ' + wait + 's').red)
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, wait * 1000)
  }

  var lastBalance = { asset: 0, currency: 0 }
  var orders = {}

  var exchange = {
    name: 'bitstamp',
    historyScan: false,
    makerFee: 0.50,
    takerFee: 0.50,

    getProducts: function () {
      return require('./products.json')
    },

    //-----------------------------------------------------
    // Public API functions
    // getQuote() and getTrades() are using Bitstamp websockets
    // The data is not done by calling the interface function,
    // but rather pulled from the "wstrades" and "wsquotes" JSOM objects
    // Those objects are populated by the websockets event handlers

    getTrades: function (opts, cb) {
      var wait = 2   // Seconds
      var func_args = [].slice.call(arguments)
      if (wstrades.length === 0) return retry('getTrades', wait, func_args)
      var trades = wstrades.splice(0, wstrades.length)
      cb(null, trades)
    },

    getQuote: function (opts, cb) {
      var wait = 2   // Seconds
      var func_args = [].slice.call(arguments)
      if (_.isEmpty(wsquotes)) return retry('getQuote', wait, func_args)
      cb(null, wsquotes)
    },

    //-----------------------------------------------------
    // Private (authenticated) functions
    //

    getBalance: function (opts, cb) {
      var wait = 10
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.balance(null, function (err, body) {
        body = statusErr(err, body)
        if (body.status === 'error') {
          return retry('getBalance', wait, func_args)
        }
        var balance = {
          asset: '0',
          asset_hold: '0',
          currency: '0',
          currency_hold: '0'
        }

        // Dirty hack to avoid engine.js bailing out when balance has 0 value
        // The added amount is small enough to not have any significant effect
        balance.currency = n(body[opts.currency.toLowerCase() + '_balance']) + 0.000001
        balance.asset = n(body[opts.asset.toLowerCase() + '_balance']) + 0.000001
        balance.currency_hold = n(body[opts.currency.toLowerCase() + '_reserved']) + 0.000001
        balance.asset_hold = n(body[opts.asset.toLowerCase() + '_reserved']) + 0.000001

        if (typeof balance.asset == undefined || typeof balance.currency == undefined) {
          console.log('Communication delay, fallback to previous balance')
          balance = lastBalance
        } else {
          lastBalance = balance
        }
        cb(null, balance)
      })
    },

    cancelOrder: function (opts, cb) {
      var wait = 2;
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.cancel_order(opts.order_id, function (err, body) {

        body = statusErr(err, body)
        if (body.status === 'error') {
          return retry('cancelOrder', wait, func_args)
        }
        cb()
      })
    },

    trade: function (type, opts, cb) {
      var client = authedClient()
      var currencyPair = joinProduct(opts.product_id).toLowerCase()
      if (typeof opts.order_type === 'undefined') {
        opts.order_type = 'maker'
      }
      // Bitstamp has no "post only" trade type
      opts.post_only = false
      if (opts.order_type === 'maker') {
        client.tradeDaily(type, currencyPair, opts.size, opts.price, function (err, body) {
          body = statusErr(err, body)
          if (body.status === 'error') {
            var order = { status: 'rejected', reject_reason: 'balance' }
            return cb(null, order)
          } else {
            // Statuses:
            // 'In Queue', 'Open', 'Finished'
            body.status = 'done'
          }
          if (body.datetime) body.done_at = body.created_at = body.datetime

          orders['~' + body.id] = body
          cb(null, body)
        })
      } else { // order_type === taker
        client.tradeMarket(type, currencyPair, opts.size, function (err, body) {
          body = statusErr(err, body)
          if (body.status === 'error') {
            var order = { status: 'rejected', reject_reason: 'balance' }
            return cb(null, order)
          } else {
            body.status = 'done'
          }
          orders['~' + body.id] = body
          cb(null, body)
        })
      }
    },

    buy: function (opts, cb) {
      exchange.trade('buy', opts, cb)
    },

    sell: function (opts, cb) {
      exchange.trade('sell', opts, cb)
    },

    getOrder: function (opts, cb) {
      var client = authedClient()
      client.order_status(opts.order_id, function (err, body) {

        body = statusErr(err, body)
        if (body.status === 'error') {
          body = orders['~' + opts.order_id]
          body.status = 'done'
          body.done_reason = 'canceled'
        } else if (body.status === 'Finished')
          body.status = 'done'

        if (body.status === 'done') {
          if (body.transactions && body.transactions[0].datetime) body.done_at = body.transactions[0].datetime
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
