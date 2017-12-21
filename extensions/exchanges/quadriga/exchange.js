var QuadrigaCX = require('quadrigacx'),
  path = require('path'),
  minimist = require('minimist'),
  moment = require('moment'),
  colors = require('colors'),
  n = require('numbro')

module.exports = function container(get, set, clear) {
  var c = get('conf')
  var s = {
    options: minimist(process.argv)
  }
  var so = s.options

  var shownWarnings = false

  var public_client, authed_client

  function publicClient() {
    if (!public_client) public_client = new QuadrigaCX("1", "", "")
    return public_client
  }

  function authedClient() {
    if (!authed_client) {
      if (!c.quadriga || !c.quadriga.key || !c.quadriga.key === 'YOUR-API-KEY') {
        throw new Error('please configure your Quadriga credentials in ' + path.resolve(__dirname, 'conf.js'))
      }

      authed_client = new QuadrigaCX(c.quadriga.client_id, c.quadriga.key, c.quadriga.secret)
    }
    return authed_client
  }

  function joinProduct(product_id) {
    return (product_id.split('-')[0] + '_' + product_id.split('-')[1]).toLowerCase()
  }

  function retry(method, args, error) {
    if (error.code === 200) {
      console.error((`\nQuadrigaCX API rate limit exceeded! unable to call ${method}, aborting`).red)
      return
    }

    if (method !== 'getTrades') {
      console.error((`\nQuadrigaCX API is down: (${method}) ${error.message}`).red)
      console.error((`Retrying in 30 seconds ...`).yellow)
    }

    setTimeout(function() {
      exchange[method].apply(exchange, args)
    }, 30000)
  }

  function debugOut(msg) {
    if (so.debug) console.log(msg)
  }

  var orders = {}

  var exchange = {
    name: 'quadriga',
    historyScan: 'backward',
    makerFee: 0.5,
    takerFee: 0.5,

    getProducts: function() {
      return require('./products.json')
    },

    getTrades: function(opts, cb) {
      var func_args = [].slice.call(arguments)
      var args = {
        book: joinProduct(opts.product_id),
        time: 'hour'
      }

      var client = publicClient()
      client.api('transactions', args, function(err, body) {
        if (!shownWarnings) {
          console.log('please note: the quadriga api does not support backfilling.')
          console.log('please note: period lengths should be set to 1h or less.')
          shownWarnings = true
        }

        if (err) return retry('getTrades', func_args, err)
        if (body.error) return retry('getTrades', func_args, body.error)

        var trades = body.filter(t => {
          return (typeof opts.from === 'undefined') ? true : (moment.unix(t.date).valueOf() > opts.from)
        }).reverse().map(function(trade) {
          return {
            trade_id: trade.tid,
            time: moment.unix(trade.date).valueOf(),
            size: Number(trade.amount),
            price: Number(trade.price),
            side: trade.side
          }
        })

        cb(null, trades)
      })
    },

    getBalance: function(opts, cb) {
      var func_args = [].slice.call(arguments)
      var client = authedClient()
      client.api('balance', function(err, wallet) {
        if (err) return retry('getBalance', func_args, err)
        if (wallet.error) return retry('getBalance', func_args, wallet.error)

        var currency = opts.currency.toLowerCase()
        var asset = opts.asset.toLowerCase()

        var balance = {
          asset: 0,
          currency: 0
        }

        balance.currency = n(wallet[currency + '_balance']).format('0.00')
        balance.asset = n(wallet[asset + '_balance']).format('0.00')

        balance.currency_hold = n(wallet[currency + '_reserved']).format('0.00000000')
        balance.asset_hold = n(wallet[asset + '_reserved']).format('0.00000000')

        debugOut(`Balance/Reserve/Hold:`)
        debugOut(`  ${currency} (${wallet[currency + '_balance']}/${wallet[currency + '_reserved']}/${wallet[currency + '_available']})`)
        debugOut(`  ${asset} (${wallet[asset + '_balance']}/${wallet[asset + '_reserved']}/${wallet[asset + '_available']})`)

        cb(null, balance)
      })
    },

    getQuote: function(opts, cb) {
      var func_args = [].slice.call(arguments)

      var params = {
        book: joinProduct(opts.product_id)
      }

      var client = publicClient()
      client.api('ticker', params, function(err, quote) {
        if (err) return retry('getQuote', func_args, err)
        if (quote.error) return retry('getQuote', func_args, quote.error)

        var r = {
          bid: String(quote.bid),
          ask: String(quote.ask)
        }

        cb(null, r)
      })
    },

    cancelOrder: function(opts, cb) {
      var func_args = [].slice.call(arguments)
      var params = {
        id: opts.order_id
      }

      debugOut(`Cancelling order ${opts.order_id}`)

      var client = authedClient()
      client.api('cancel_order', params, function(err, body) {
        if (err) return retry('cancelOrder', func_args, err)
        if (body.error) return retry('cancelOrder', func_args, body.error)
        cb()
      })
    },

    buy: function(opts, cb) {
      var params = {
        amount: opts.size,
        book: joinProduct(opts.product_id)
      }

      if (opts.order_type === 'maker') {
        params.price = n(opts.price).format('0.00')
      }

      debugOut(`Requesting ${opts.order_type} buy for ${opts.size} assets`)

      var client = authedClient()
      client.api('buy', params, function(err, body) {
        var order = {
          id: null,
          status: 'open',
          price: Number(opts.price),
          size: Number(opts.size),
          created_at: new Date().getTime(),
          filled_size: 0,
          ordertype: opts.order_type
        }

        if (err) return cb(err)
        if (body.error) return cb(body.error)

        if (opts.order_type === 'taker') {
          order.status = 'done'
          order.done_at = new Date().getTime()

          if (body.orders_matched) {
            var asset_total = 0
            var price_total = 0.0
            var order_count = body.orders_matched.length
            for (var idx = 0; idx < order_count; idx++) {
              asset_total = asset_total + Number(body.orders_matched[idx].amount)
              price_total = price_total + (Number(body.orders_matched[idx].amount) * Number(body.orders_matched[idx].price))
            }

            order.price = price_total / asset_total
            order.size = asset_total
          } else {
            order.price = Number(body.price)
            order.size = Number(body.amount)
          }
        }

        debugOut(`    Purchase ID: ${body.id}`)

        order.id = body.id
        orders['~' + body.id] = order
        cb(null, order)
      })
    },

    sell: function(opts, cb) {
      var params = {
        amount: opts.size,
        book: joinProduct(opts.product_id)
      }

      if (opts.order_type === 'maker' && typeof opts.type === 'undefined') {
        params.price = n(opts.price).format('0.00')
      }

      debugOut(`Requesting ${opts.order_type} sell for ${opts.size} assets`)

      var client = authedClient()
      client.api('sell', params, function(err, body) {
        var order = {
          id: null,
          status: 'open',
          price: Number(opts.price),
          size: Number(opts.size),
          created_at: new Date().getTime(),
          filled_size: 0,
          ordertype: opts.order_type
        }

        if (err) return cb(err)
        if (body.error) return cb(body.error)

        if (opts.order_type === 'taker') {
          order.status = 'done'
          order.done_at = new Date().getTime()

          if (body.orders_matched) {
            var asset_total = 0
            var price_total = 0.0
            var order_count = body.orders_matched.length
            for (var idx = 0; idx < order_count; idx++) {
              asset_total = asset_total + Number(body.orders_matched[idx].amount)
              price_total = price_total + (Number(body.orders_matched[idx].amount) * Number(body.orders_matched[idx].price))
            }

            order.price = price_total / asset_total
            order.size = asset_total
          } else {
            order.price = Number(body.price)
            order.size = Number(body.amount)
          }
        }

        debugOut(`    Sell ID: ${body.id}`)

        order.id = body.id
        orders['~' + body.id] = order
        cb(null, order)
      })
    },

    getOrder: function(opts, cb) {
      var order = orders['~' + opts.order_id]
      var params = {
        id: opts.order_id
      }

      var client = authedClient()
      client.api('lookup_order', params, function(err, body) {
        if (err) return cb(err)
        if (body.error) return cb(body.error)

        if (body[0].status === 2) {
          order.status = 'done'
          order.done_at = new Date().getTime()
          order.filled_size = n(body[0].amount).format('0.00000')
          order.price = n(body[0].price).format('0.00')
          return cb(null, order)
        } else {
          order.filled_size = n(body[0].amount).format('0.00000')
          order.price = n(body[0].price).format('0.00')
        }

        debugOut(`Lookup order ${opts.order_id} status is ${body.status}`)

        cb(null, order)
      })
    },

    // return the property used for range querying.
    getCursor: function(trade) {
      return (trade.time || trade)
    }
  }
  return exchange
}
