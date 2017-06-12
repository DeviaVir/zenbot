var Bitstamp = require('bitstamp')
  , minimist = require('minimist')
  , path = require('path')
  , colors = require('colors')
  , numbro = require('numbro')
  , Pusher = require('pusher-js/node')

var args = process.argv

var wsOpts = {
  encrypted: true,
  pairOk: false,
  currencyPair: 'btcusd',
  trades: {evType: 'trade', channel: 'live_trades'},
  quotes: {evType: 'data', channel: 'order_book'}
}

// The use of bitstamp-ws  requires that
// Knowledge of the asset/currency pair
// before the first call for a trade
// As zenbot dont returns the currency pair
// before the first trade is requested
// it ha ben neccessary to get it from 
// the command line arguments
args.forEach(function(value) {
  if (value.match(/bitstamp|BITSTAMP/)) {
      var p = value.split('.')[1]
      var prod = p.split('-')[0] + p.split('-')[1]
      var pair = prod.toLowerCase()
      if (!wsOpts.pairOk) {
        if (pair !== 'btcusd') {
          wsOpts.trades.channel = 'live_trades_' + pair
          wsOpts.quotes.channel = 'order_book_' + pair
        }
        wsOpts.currencyPair = pair
        wsOpts.pairOk = true
      }
   }
})

function joinProduct (product_id) {
  return product_id.split('-')[0] + product_id.split('-')[1]
}


module.exports = function container (get, set, clear) {

  var c = get('conf')
  var defs = require('./conf-sample')

  try {
    c.bitstamp = require('./conf')
  }
  catch (e) {
    c.bitstamp = {}
  }
  Object.keys(defs).forEach(function (k) {
    if (typeof c.bitstamp[k] === 'undefined') {
      c.bitstamp[k] = defs[k]
    }
  })

  //console.log(c.bitstamp)
  function authedClient () {
    if (c.bitstamp.key && c.bitstamp.key !== 'YOUR-API-KEY') {
      return new Bitstamp(c.bitstamp.key, c.bitstamp.secret, c.bitstamp.client_id)
    }
    throw new Error('please configure your Bitstamp credentials in ' + path.resolve(__dirname, 'conf.js'))
  }

//***************************************************
//
//  The websocket functions
//
var BITSTAMP_PUSHER_KEY = 'de504dc5763aeef9ff52'

var Bitstamp_WS = function(opts) {
  if (opts) {
    this.opts = opts
  }
  else {
    this.opts = {
      encrypted: true,
    }
  }

  this.client = new Pusher(BITSTAMP_PUSHER_KEY, {
      encrypted: this.opts.encrypted
      //encrypted: true
  })

  // bitstamp publishes all data over just 2 channels
  // make sure we only subscribe to each channel once
  this.bound = {
    trade: false,
    data: false
  }

  this.subscribe()
}

var util = require('util')
var EventEmitter = require('events').EventEmitter
util.inherits(Bitstamp_WS, EventEmitter)


Bitstamp_WS.prototype.subscribe = function() {
//console.log('wsOpts ==> ', wsOpts)
  if (wsOpts.pairOk) {
    this.client.subscribe(wsOpts.trades.channel)
    this.client.bind(wsOpts.trades.evType, this.broadcast(wsOpts.trades.evType))
    this.client.subscribe(wsOpts.quotes.channel)
    this.client.bind(wsOpts.quotes.evType, this.broadcast(wsOpts.quotes.evType))
  }
}

Bitstamp_WS.prototype.broadcast = function(name) {
  if(this.bound[name])
    return function noop() {}
  this.bound[name] = true

  return function(e) {
    this.emit(name, e)
  }.bind(this)
}
  // Placeholders
  wsquotes = {bid: 0, ask: 0}
  wstrades =
  [
    {
      trade_id: 0,
      time:1000,
      size: 0,
      price: 0,
      side: ''
    } 
  ]

var wsTrades = new Bitstamp_WS({
  channel: wsOpts.trades.channel,
  evType: 'trade'
})

var wsQuotes = new Bitstamp_WS({
  channel: wsOpts.quotes.channel,
  evType: 'data'
})

wsTrades.on('data', function(data) {
  wsquotes = {
    bid: data.bids[0][0],
    ask: data.asks[0][0]
  }
})

wsQuotes.on('trade', function(data) {
  wstrades.push( {
    trade_id: data.id,
    time: Number(data.timestamp) * 1000,
    size: data.amount,
    price: data.price,
    side: data.type === 0 ? 'buy' : 'sell'
  })
  if (wstrades.length > 30) wstrades.splice(0,10)
//  console.log('trades: ',wstrades)
})

//***************************************************

  function statusErr (err, body) {
    if (typeof body === 'undefined') {
      var ret = {}
      var res = err.toString().split(':',2)
      ret.status = res[1]
      var ret = new Error(ret.status )
      return ret
    } else { 
      if (body.error) {
        var ret = new Error('Error: ' + body.error) 
        return ret
      } else {
        return body 
      }
    }
  }

  function retry (method, args) {
    var to = args.wait
    if (method !== 'getTrades') {
      console.error(('\nBitstamp API is not answering! unable to call ' + method + ',OB retrying...').red)
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, args.wait)
  }

  var exchange = {
    name: 'bitstamp',
    historyScan: false,
    makerFee: 0.25,
    takerFee: 0.25,

    getProducts: function (opts) {
      return require('./products.json')
    },

    //-----------------------------------------------------
    // Public API functions 
    // getQuote() and getTrades are using Bitstamp websockets
    // The data is not done by calling the interface function,
    // but rather pulled from the "wstrades" and "wsquotes" JSOM objects
    // Those objects are populated by the websockets event handlers

    getTrades: function (opts, cb) {
      var currencyPair = joinProduct(opts.product_id).toLowerCase()

      var args = {
        wait: 2000,
        product_id: wsOpts.currencyPair
      }

      if (opts.from) {
        args.before = opts.from
      }
      else if (opts.to) {
        args.after = opts.to
      }

      if (typeof wstrades.time == undefined) return retry('getTrades', args)
      var t = wstrades
      var trades = t.map(function (trade) {
        return (trade)
      })

      cb(null, trades)
    },

    getQuote: function (opts, cb) {
      var args = {
        wait: 2000,
        currencyPair: wsOpts.currencyPair
      }
      if (typeof wsquotes.bid == undefined) return retry('getQuote', args )
      cb(null, wsquotes)
    },

    //-----------------------------------------------------
    // Private (authenticated) functions
    //

    getBalance: function (opts, cb) {
      var client = authedClient()
      client.balance(null, function (err, body) {
        body = statusErr(err,body)
        var balance = {asset: 0, currency: 0}
	balance.currency = body[opts.currency.toLowerCase() + '_available']
        balance.asset = body[opts.asset.toLowerCase() + '_available']
	balance.currency_hold = 0
	balance.asset_hold = 0
        cb(null, balance)
      })
    },

    cancelOrder: function (opts, cb) {
      var client = authedClient()
      client.cancel_order(opts.order_id, function (err, body) {
        body = statusErr(err,body)
        cb()
      })
    },

    cancelOrders: function (opts, cb) {
      var client = authedClient()
      client.cancel_all_orders(function (err, body) {
        body = statusErr(err,body)
        cb()
      })
    },

    buy: function (opts, cb) {
      var client = authedClient()
      var currencyPair = joinProduct(opts.product_id).toLowerCase()
      if (typeof opts.order_type === 'undefined' ) {
	opts.order_type = 'maker'
	}
      if (opts.order_type === 'maker') {
	// Fix maker?
        client.buy(currencyPair, opts.size, opts.price, false, function (err, body) {
          body = statusErr(err,body)
          cb(null, body)
        })
      } else {
        client.buyMarket(currencyPair, opts.size, function (err, body) {
          body = statusErr(err,body)
          cb(null, body)
        })
      }
    },

    sell: function (opts, cb) {
      var client = authedClient()
      var currencyPair = joinProduct(opts.product_id).toLowerCase()
      if (typeof opts.order_type === 'undefined' ) {
	opts.order_type = 'maker'
      }
      if (opts.order_type === 'maker') {
        client.sell(currencyPair, opts.size, opts.price, false, function (err, body) {
          body = statusErr(err,body)
          cb(null, body)
        })
      } else {
        client.sellMarket(currencyPair, opts.size, function (err, body) {
          body = statusErr(err,body)
          cb(null, body)
        })
      }
    },

    getOrder: function (opts, cb) {
      var client = authedClient()
      client.getOrder(opts.order_id, function (err, body) {
        body = statusErr(err,body)
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
