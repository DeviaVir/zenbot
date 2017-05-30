var KrakenClient = require('kraken-api'),
  path = require('path'),
  moment = require('moment'),
  n = require('numbro'),
  colors = require('colors')

module.exports = function container(get, set, clear) {
  var c = get('conf');

  var public_client, authed_client;
  var recoverableErrors = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'];

  function publicClient() {
    if (!public_client) {
      public_client = new KrakenClient();
    }
    return public_client;
  }

  function authedClient() {
    if (!authed_client) {
      if (!c.kraken || !c.kraken.key || c.kraken.key === 'YOUR-API-KEY') {
        throw new Error('please configure your Kraken credentials in conf.js')
      }
      authed_client = new KrakenClient(c.kraken.key, c.kraken.secret);
    }
    return authed_client;
  }

  function joinProduct(product_id) {
    return product_id.split('-')[0] + product_id.split('-')[1];
  }

  function retry(method, args) {
    if (method !== 'getTrades') {
      console.error(('\nKraken API is down! unable to call ' + method + ', retrying in 2.5s').red);
    }
    setTimeout(function () {
      exchange[method].apply(exchange, args)
    }, 2500);
  }

  var exchange = {
    name: 'kraken',
    historyScan: 'forward',
    makerFee: 0.16,

    getProducts: function () {
      return require('./products.json');
    },

    getTrades: function (opts, cb) {
      var func_args = [].slice.call(arguments);
      var client = publicClient();
      var args = {
        pair: joinProduct(opts.product_id)
      }
      if (opts.from) {
        args.since = parseFloat(opts.from) * 1000000000;
      }

      client.api('Trades', args, function (error, data) {
        if (error) {
          console.error(('\nTrades error:').red);
          console.error(error)
        }
        if (data.error.length) {
          return cb(data.error.join(','));
        }

        var trades = [];
        Object.keys(data.result[args.pair]).forEach(function (i) {
          var trade = data.result[args.pair][i];
          if (!opts.to || (parseFloat(opts.to) >= parseFloat(trade[2]))) {
            trades.push({
              trade_id: trade[2] + trade[1] + trade[0],
              time: moment.unix(trade[2]).valueOf(),
              size: parseFloat(trade[1]),
              price: parseFloat(trade[0]),
              side: trade[3] == 'b' ? 'buy' : 'sell'
            });
          }
        });
        cb(null, trades);
      });
    },

    getBalance: function (opts, cb) {
      var args = [].slice.call(arguments);
      var client = authedClient();
      client.api('Balance', null, function (error, data) {
        var balance = {
          asset: 0,
          currency: 0
        };

        if (error) {
          if (recoverableErrors.indexOf(error.code) >= 0) { return retry('getBalance', args) }
          console.error(('\ngetBalance error:').red);
          console.error(error);
        }
        if (data.error.length) {
          return cb(data.error.join(','));
        }
        if (data.result[opts.currency]) {
          balance.currency = n(data.result[opts.currency]).format('0.00000000'),
          balance.currency_hold = 0
        }
        if (data.result[opts.asset]) {
          balance.asset = n(data.result[opts.asset]).format('0.00000000'),
          balance.asset_hold = 0
        }
        cb(null, balance);
      });
    },

    getQuote: function (opts, cb) {
      var args = [].slice.call(arguments);
      var client = publicClient();
      var pair = joinProduct(opts.product_id);
      client.api('Ticker', {
        pair: pair
      }, function (error, data) {
        if (error) {
          if (recoverableErrors.indexOf(error.code) >= 0) { return retry('getQuote', args) }
          console.error(('\ngetQuote error:').red);
          console.error(error);
        }
        if (data.error.length) {
          return cb(data.error.join(','));
        }
        cb(null, {
          bid: data.result[pair].b[0],
          ask: data.result[pair].a[0],
        });
      });
    },

    cancelOrder: function (opts, cb) {
      var args = [].slice.call(arguments);
      var client = authedClient();
      client.api('CancelOrder', {
        txid: opts.order_id
      }, function (error, data) {
        if (error) {
          if (recoverableErrors.indexOf(error.code) >= 0) { return retry('cancelOrder', args) }
          console.error(('\ncancelOrder error:').red);
          console.error(error);
        }
        if (data.error.length) {
          return cb(data.error.join(','));
        }
        cb(null);
      });
    },

    trade: function (type, opts, cb) {
      var args = [].slice.call(arguments);
      var client = authedClient();
      var params = {
        pair: joinProduct(opts.product_id),
        type: type,
        ordertype: 'limit',
        price: opts.price,
        volume: opts.size,
        trading_agreement: c.kraken.tosagree,
        oflags: opts.post_only === true ? 'post' : undefined
      }
      client.api('AddOrder', params, function (error, data) {
        if (error && recoverableErrors.indexOf(error.code) >= 0) { return cb(error) }

        var order = {
          id: data && data.result ? data.result.txid[0] : null,
          status: 'open',
          price: opts.price,
          size: opts.size,
          post_only: !!opts.post_only,
          created_at: new Date().getTime(),
          filled_size: '0'
        };

        if (error) {
          if (error.message.match(/Order:Insufficient funds$/)) {
            order.status = 'rejected'
            order.reject_reason = 'balance'
            return cb(null, order)
          } else if (error.message.length) {
            console.error(('\nUnhandeld AddOrder error:').red);
            console.error(error);

            order.status = 'rejected';
            order.reject_reason = data.error.join(',');
            return cb(null, order);
          }
        }

        cb(null, order);
      })
    },

    buy: function (opts, cb) {
      exchange.trade('buy', opts, cb);
    },

    sell: function (opts, cb) {
      exchange.trade('sell', opts, cb);
    },

    getOrder: function (opts, cb) {
      var args = [].slice.call(arguments);
      var client = authedClient();
      var params = {
        txid: opts.order_id
      }
      client.api('QueryOrders', params, function (error, data) {
        if (error) {
          if (recoverableErrors.indexOf(error.code) >= 0) { return retry('getOrder', args) }
          console.error(('\ngetOrder error:').red);
          console.error(error);
        }
        if (data.error.length) {
          return cb(data.error.join(','));
        }
        var orderData = data.result[params.txid];

        if (!orderData) {
          return cb('Order not found');
        }

        var order = {
          id: orderData.refid,
          status: orderData.status,
          price: orderData.price,
          size: orderData.vol,
          post_only: !!orderData.oflags.match(/post/),
          created_at: orderData.opentm * 1000,
          filled_size: parseFloat(orderData.vol) - parseFloat(orderData.vol_exec)
        };

        if (orderData.status === 'closed') {
          order.status = 'done'
          order.done_at = new Date().getTime()
          return cb(null, order)
        }

        cb(null, order);
      })
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return Math.floor((trade.time || trade) / 1000);
    }
  }
  return exchange;
}
