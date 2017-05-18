var Poloniex = require('poloniex.js')
  , path = require('path')
  , moment = require('moment')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  var defs = require('./conf-sample')
  try {
    c.poloniex = require('./conf')
  }
  catch (e) {
    c.poloniex = {}
  }
  Object.keys(defs).forEach(function (k) {
    if (typeof c.poloniex[k] === 'undefined') {
      c.poloniex[k] = defs[k]
    }
  })

  var public_client, authed_client

  function publicClient (product_id) {
    if (!public_client) public_client = new Poloniex(c.poloniex.key, c.poloniex.secret)
    return public_client
  }

  function authedClient () {
    if (!authed_client) {
      if (!c.poloniex.key || c.poloniex.key === 'YOUR-API-KEY') {
        throw new Error('please configure your Poloniex credentials in ' + path.resolve(__dirname, 'conf.js'))
      }
      authed_client = new Poloniex(c.poloniex.key, c.poloniex.secret)
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

  function joinProduct (product_id) {
    return product_id.split('-')[1] + '_' + product_id.split('-')[0]
  }

  return {
    name: 'poloniex',
    historyScan: 'forward',
    makerFee: 0.015,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      var client = publicClient()
      var args = {
        currencyPair: joinProduct(opts.product_id)
      }
      if (opts.from) {
        args.start = opts.from
      }
      if (opts.to) {
        args.end = opts.to
      }
      if (args.start && !args.end) {
        // add 24 hours
        args.end = args.start + 86400
      }

      client._public('returnTradeHistory', args, function (err, body) {
        if (err) return cb(err)
        var trades = body.map(function (trade) {
          return {
            trade_id: trade.tradeID,
            time: moment.utc(trade.date).valueOf(),
            size: Number(trade.amount),
            price: Number(trade.rate),
            side: trade.type
          }
        })
        cb(null, trades)
      })
    },

    getBalance: function (opts, cb) {
      var client = authedClient()
      client.returnCompleteBalances(function (err, body) {
        if (err) return cb(err)
        var balance = {asset: 0, currency: 0}
        if (body[opts.currency]) {
          balance.currency = n(body[opts.currency].available).add(body[opts.currency].onOrders).format('0.00000000')
          balance.currency_hold = body[opts.currency].onOrders
        }
        if (body[opts.asset]) {
          balance.asset = n(body[opts.asset].available).add(body[opts.asset].onOrders).format('0.00000000')
          balance.asset_hold = body[opts.asset].onOrders
        }
        cb(null, balance)
      })
    },

    getQuote: function (opts, cb) {
      var args = _.toArray(arguments);
      this.poloniex.getTicker(function(err, data) {
        if(err)
          return this.retry(this.getTicker, args);

        var tick = data[this.pair];

        callback(null, {
          bid: parseFloat(tick.highestBid),
          ask: parseFloat(tick.lowestAsk),
        });

      }.bind(this));


      var client = publicClient(opts.product_id)
      client.getProductTicker(function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, {bid: body.bid, ask: body.ask})
      })
    },

    cancelOrder: function (opts, cb) {
      var cancel = function(err, result) {
        if(err || !result.success) {
            log.error('unable to cancel order', order, '(', err, result, ')');
          }
        }.bind(this);

      this.poloniex.cancelOrder(this.currency, this.asset, order, cancel);

      var client = authedClient()
      client.cancelOrder(opts.order_id, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb()
      })
    },

    buy: function (opts, cb) {
      var set = function(err, result) {
        if(err || result.error)
          return log.error('unable to buy:', err, result);

        callback(null, result.orderNumber);
      }.bind(this);

      this.poloniex.buy(this.currency, this.asset, price, amount, set);


      var client = authedClient()
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      client.buy(opts, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, body)
      })
    },

    sell: function (opts, cb) {
      var set = function(err, result) {
        if(err || result.error)
          return log.error('unable to sell:', err, result);

        callback(null, result.orderNumber);
      }.bind(this);

      this.poloniex.sell(this.currency, this.asset, price, amount, set);


      var client = authedClient()
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      client.sell(opts, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, body)
      })
    },

    getOrder: function (opts, cb) {
      var check = function(err, result) {
        var stillThere = _.find(result, function(o) { return o.orderNumber === order });
        callback(err, !stillThere);
      }.bind(this);

      this.poloniex.myOpenOrders(this.currency, this.asset, check);


      var client = authedClient()
      client.getOrder(opts.order_id, function (err, resp, body) {
        if (!err) err = statusErr(resp, body)
        if (err) return cb(err)
        cb(null, body)
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return Math.floor((trade.time || trade) / 1000)
    }
  }
}
