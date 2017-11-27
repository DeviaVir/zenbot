const BFX = require('bitfinex-api-node')
var _ = require('lodash')
  , minimist = require('minimist')
  , path = require('path')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  var s = {options: minimist(process.argv)}
  var so = s.options

  var ws_connecting = false
  var ws_connected = false
  var ws_timeout = 60000
  var ws_retry = 10000

  var pair, public_client, ws_client

  var ws_trades = []
  var ws_balance = []
  var ws_orders = []
  var ws_ticker = []
  var ws_hb = []
  var ws_walletCalcDone
  var heartbeat_interval

  function publicClient () {
    if (!public_client) public_client = new BFX(null,null, {version: 2, transform: true}).rest
    return public_client
  }

  function wsUpdateTrades (pair, trades) {
    if (trades[0] === "tu") {
      trades = [trades[1]]
    } else if (trades[0] === "te") {
      return
    }

    trades.forEach(function (trade) {
      newTrade = {
        trade_id: Number(trade.ID),
        time: Number(trade.MTS),
        size: Math.abs(trade.AMOUNT),
        price: Number(trade.PRICE),
        side: trade.AMOUNT > 0 ? 'buy' : 'sell'
      }
      ws_trades.push(newTrade)
    })

    if (ws_trades.length > 1010)
      ws_trades.shift()
  }

  function wsUpdateTicker (pair, ticker) {
    ws_ticker = ticker
  }

  function wsMessage (message) {
    if (message.event == "auth" && message.status == "OK") {
      if (so.debug) { console.log(("\nWebSockets: We are now fully connected and authenticated.").green) }
      ws_connecting = false
      ws_connected = true
    }

    if (message[0] != "undefined")
      ws_hb[message[0]] = Date.now()
  }

  function wsUpdateOrder (ws_order) {
    cid = ws_order[2]

    // https://bitfinex.readme.io/v2/reference#ws-auth-orders
    var order = ws_orders['~' + cid]
    if (!order) {
      if (so.debug) console.warn(("\nWarning: Order " + cid + ' not found in cache for wsUpdateOrder (manual order?).').red)
      return
    }

    if (ws_order[13] === 'ACTIVE' || ws_order[13].match(/^PARTIALLY FILLED/)) {
      order.status = 'open'
    } else if (ws_order[13].match(/^EXECUTED/)) {
      order.status = 'done'
    } else if (ws_order[13] === 'CANCELED') {
      order.status = 'rejected'
    } else if (ws_order[13] === 'POSTONLY CANCELED') {
      order.status = 'rejected'
      order.reject_reason = 'post only'
    }

    order.bitfinex_id = ws_order[0]
    order.created_at = ws_order[4]
    order.filled_size = n(ws_order[7]).subtract(ws_order[6]).format('0.00000000')
    order.bitfinex_status = ws_order[13]
    order.price = ws_order[16]
    order.price_avg = ws_order[17]

    ws_orders['~' + cid] = order
  }

  function wsUpdateOrderCancel (ws_order) {
    cid = ws_order[2]

    if (!ws_orders['~' + cid]) {
      if (so.debug) console.warn(("\nWarning: Order " + cid + ' not found in cache for wsUpdateOrderCancel (manual order?).').red)
      return
    }

    if (ws_order[13].match(/^INSUFFICIENT MARGIN/)) {
      ws_orders['~' + cid].status = 'rejected'
      ws_orders['~' + cid].reject_reason = 'balance'
    }

    setTimeout(function () {
      delete(ws_orders['~' + cid])
    }, 60000 * 60 * 12)

    wsUpdateOrder(ws_order)
  }

  function wsUpdateReqOrder (error) {
    if (error[6] === 'ERROR' && error[7].match(/^Invalid order: not enough .* balance for/)) {
      cid = error[4][2]

      if (!ws_orders['~' + cid]) {
        if (so.debug) console.warn(("\nWarning: Order " + cid + ' not found in cache for wsUpdateReqOrder (manual order?).').red)
        return
      }

      ws_orders['~' + cid].status = 'rejected'
      ws_orders['~' + cid].reject_reason = 'balance'
    }
    if (error[6] === 'ERROR' && error[7] === 'Invalid price.') {
      cid = error[4][2]

      if (!ws_orders['~' + cid]) {
        if (so.debug) console.warn(("\nWarning: Order " + cid + ' not found in cache for wsUpdateReqOrder (manual order?).').red)
        return
      }
      
      if (so.debug) console.log(ws_orders['~' + cid])

      ws_orders['~' + cid].status = 'rejected'
      ws_orders['~' + cid].reject_reason = 'price'
    }
  }

  function updateWallet (wallets) {
    if (typeof(wallets[0]) !== "object") wallets = [wallets]

    wallets.forEach(function (wallet) {
      if (wallet[0] === c.bitfinex.wallet) {
        ws_balance[wallet[1].toUpperCase()] = {}
        ws_balance[wallet[1].toUpperCase()].balance = wallet[2]
        ws_balance[wallet[1].toUpperCase()].available = wallet[4] ? wallet[4] : 0
        if (wallet[4] !== null) { ws_walletCalcDone[wallet[1]] = true }
      }
    })
  }

  function wsConnect () {
    if (ws_connected || ws_connecting) return
    ws_client.open()
  }

  function wsOpen () {
    ws_client.auth()
    ws_client.subscribeTrades(pair)
    ws_client.subscribeTicker(pair)
  }

  function wsSubscribed (event) {
    // We only use the 'trades' channel for heartbeats. That one should be most frequently updated.
    if (event.channel === "trades") {
      ws_hb[event.chanId] = Date.now()

      heartbeat_interval = setInterval(function() {
        if (ws_hb[event.chanId]) {
          var timeoutThreshold = (Number(Date.now()) - ws_timeout)
          if (timeoutThreshold > ws_hb[event.chanId]) {
            console.warn(("\nWebSockets Warning: No message on channel 'trade' within " + ws_timeout / 1000 + ' seconds, reconnecting...').red)
            ws_client.close()
          }
        }
      }, ws_timeout)
    }
  }

  function wsClose () {
    ws_connecting = false
    ws_connected = false
    clearInterval(heartbeat_interval)

    console.error(("\nWebSockets Error: Connection closed.").red + " Retrying every " + (ws_retry / 1000 + ' seconds').yellow + '.')
  }

  function wsError (e) {
    ws_connecting = false
    ws_connected = false

    if (e.event == "auth" && e.status == "FAILED") {
      errorMessage = ("\nWebSockets Warning: Authentication " + e.status + ' (Reason: "' + e.msg + '").').red
      if (e.msg == 'apikey: invalid') errorMessage = errorMessage + "\nEither your API key is invalid or you tried reconnecting to quickly. Wait and/or check your API keys."
      console.warn(errorMessage)
      ws_client.close()
    }
    else {
      ws_client.close()
    }
  }

  function wsClient () {
    if (!ws_client) {
      if (!c.bitfinex || !c.bitfinex.key || c.bitfinex.key === 'YOUR-API-KEY') {
        throw new Error('please configure your Bitfinex credentials in ' + path.resolve(__dirname, 'conf.js'))
      }
      ws_connecting = true
      ws_connected = false

      ws_client = new BFX(c.bitfinex.key, c.bitfinex.secret, {version: 2, transform: true}).ws

      ws_client
        .on('open', wsOpen)
        .on('close', wsClose)
        .on('error', wsError)
        .on('subscribed', wsSubscribed)
        .on('message', wsMessage)
        .on('trade', wsUpdateTrades)
        .on('ticker', wsUpdateTicker)
        .on('ws', updateWallet)
        .on('wu', updateWallet)
        .on('on', wsUpdateOrder)
        .on('on-req', wsUpdateReqOrder)
        .on('ou', wsUpdateOrder)
        .on('oc', wsUpdateOrderCancel)

      setInterval(function() {
        wsConnect()
      }, ws_retry)
    }
  }

  function joinProduct (product_id) {
    return product_id.split('-')[0] + '' + product_id.split('-')[1]
  }

  function retry (method, args, cb) {
    setTimeout(function () {
      exchange[method].call(exchange, args, cb)
    }, ws_retry)
  }

  function waitForCalc (method, args, cb) {
    setTimeout(function () {
      exchange[method].call(exchange, args, cb)
    }, 50)
  }

  function encodeQueryData(data) {
    let ret = []
    for (let d in data)
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
    return ret.join('&')
  }

  var exchange = {
    name: 'bitfinex',
    historyScan: 'backward',
    makerFee: 0.1,
    takerFee: 0.2,

    getProducts: function () {
      return require('./products.json')
    },

    getTrades: function (opts, cb) {
      if (!pair) { pair = joinProduct(opts.product_id) }

      // Backfilling using the REST API
      if (opts.to || opts.to === null) {
        var func_args = [].slice.call(arguments)
        var client = publicClient()
        var args = {}
        args.sort = -1 //backward
        args.limit = 1000
        if (opts.from) {
          args.start = opts.from
        }
        else if (opts.to) {
          args.end = opts.to
        }
        else if (args.start && !args.end) {
          args.end = args.start + 500000
        }
        else if (args.end && !args.start) {
          args.start = args.end - 500000
        }
        var query = encodeQueryData(args)
        var tpair = 't' + joinProduct(opts.product_id)
        client.makePublicRequest('trades/' + tpair + '/hist?' + query, function (err, body) {
          if (err) return retry('getTrades', opts, cb)
          var trades = body.map(function(trade) {
            return {
              trade_id: trade.ID,
              time: trade.MTS,
              size: Math.abs(trade.AMOUNT),
              price: trade.PRICE,
              side: trade.AMOUNT > 0 ? 'buy' : 'sell'
            }
          })
          cb(null, trades)
        })
      } else {
        // We're live now (i.e. opts.from is set), use websockets
        if (!ws_client) { wsClient() }
        if (typeof(ws_trades) === "undefined") { return retry('getTrades', opts, cb) }
        trades = ws_trades.filter(function (trade) { return trade.time >= opts.from })
        cb(null, trades)
      }
    },

    getBalance: function (opts, cb) {
      if (!pair) { pair = joinProduct(opts.asset + '-' + opts.currency) }

      if (pair && !ws_walletCalcDone) {
        ws_walletCalcDone = {}
        ws_walletCalcDone[opts.asset] = false
        ws_walletCalcDone[opts.currency] = false
      }

      if (!ws_client) { wsClient() }
      if (Object.keys(ws_balance).length === 0) {
        if (so.debug && ws_connected === true) {
          console.warn(("WebSockets Warning: Waiting for initial websockets snapshot.").red + " Retrying in " + (ws_retry / 1000 + ' seconds').yellow + '.')
        }
        return retry('getBalance', opts, cb)
      }

      if (ws_walletCalcDone[opts.asset] === false && ws_walletCalcDone[opts.currency] === false) {
        var ws_update_wallet = [
          0,
          'calc',
          null,
          [
            ["wallet_exchange_" + opts.currency],
            ["wallet_exchange_" + opts.asset]
          ]
        ]

        try {
          ws_walletCalcDone[opts.asset] = "inProgress"
          ws_walletCalcDone[opts.currency] = "inProgress"

          ws_client.send(ws_update_wallet)
        }
        catch (e) {
          if (so.debug) {
            console.warn(e)
            console.warn(("\nWebSockets Warning: Cannot send 'calc' for getBalance update (maybe connection not open?).").red + ' Waiting for reconnect.')
          }
        }

        return waitForCalc('getBalance', opts, cb)
      }
      else if (
        (ws_walletCalcDone[opts.asset] === false && ws_walletCalcDone[opts.currency] === true) ||
        (ws_walletCalcDone[opts.asset] === true && ws_walletCalcDone[opts.currency] === false)
      ) {
        return waitForCalc('getBalance', opts, cb)
      }
      else {
        balance = {}
        balance.currency      = ws_balance[opts.currency] && ws_balance[opts.currency].balance   ? n(ws_balance[opts.currency].balance).format('0.00000000') : n(0).format('0.00000000')
        balance.asset         = ws_balance[opts.asset]    && ws_balance[opts.asset].balance      ? n(ws_balance[opts.asset].balance).format('0.00000000')    : n(0).format('0.00000000')

        balance.currency_hold = ws_balance[opts.currency] && ws_balance[opts.currency].available ? n(ws_balance[opts.currency].balance).subtract(ws_balance[opts.currency].available).format('0.00000000') : n(0).format('0.00000000')
        balance.asset_hold    = ws_balance[opts.asset]    && ws_balance[opts.asset].available    ? n(ws_balance[opts.asset].balance).subtract(ws_balance[opts.asset].available).format('0.00000000')       : n(0).format('0.00000000')

        ws_walletCalcDone[opts.asset] = false
        ws_walletCalcDone[opts.currency] = false

        cb(null, balance)
      }
    },

    getQuote: function (opts, cb) {
      cb(null, { bid : String(ws_ticker.BID), ask : String(ws_ticker.ASK) })
    },

    cancelOrder: function (opts, cb) {
      order = ws_orders['~' + opts.order_id]
      ws_orders['~' + opts.order_id].reject_reason = "zenbot cancel"

      var ws_cancel_order = [
        0,
        'oc',
        null,
        {
          id: order.bitfinex_id
        }
      ]

      try {
        ws_client.send(ws_cancel_order)
      }
      catch (e) {
        if (so.debug) {
          console.warn(e)
          console.warn(("\nWebSockets Warning: Cannot send cancelOrder (maybe connection not open?).").red + " Retrying in " + (ws_retry / 1000 + ' seconds').yellow + '.')
        }
        return retry('cancelOrder', opts, cb)
      }
      cb()
    },

    trade: function (action, opts, cb) {
      if (!pair) { pair = joinProduct(opts.product_id) }
      var symbol = 't' + pair

      if (!ws_client) { wsClient() }

      var cid = Math.round(((new Date()).getTime()).toString() * Math.random())
      var amount = action === 'buy' ? opts.size : opts.size * -1
      var price = opts.price

      if (opts.order_type === 'maker' && typeof opts.type === 'undefined') {
        opts.type = 'EXCHANGE LIMIT'
      }
      else if (opts.order_type === 'taker' && typeof opts.type === 'undefined') {
        opts.type = 'EXCHANGE MARKET'
      }
      if (typeof opts.post_only === 'undefined') {
        opts.post_only = true
      }
      var type = opts.type
      var is_postonly = opts.post_only

      var order = {
        id: cid,
        bitfinex_id: null,
        status: 'open',
        price: opts.price,
        size: opts.size,
        post_only: !!opts.post_only,
        created_at: new Date().getTime(),
        filled_size: 0,
        ordertype: opts.order_type
      }

      var ws_order = [
        0,
        'on',
        null,
        {
          cid: cid,
          type: type,
          symbol: symbol,
          amount: String(amount),
          price: price,
          hidden: 0,
          postonly: is_postonly ? 1 : 0
        }
      ]

      try {
        ws_client.send(ws_order)
      }
      catch (e) {
        if (so.debug) {
          console.warn(e)
          console.warn(("\nWebSockets Warning: Cannot send trade (maybe connection not open?).").red + (" Orders are sensitive, we're marking this one as rejected and will not just repeat the order automatically.").yellow)
        }

        order.status = 'rejected'
        order.reject_reason = 'could not send order over websockets'
      }
      ws_orders['~' + cid] = order

      return cb(null, order)
    },

    buy: function (opts, cb) {
      exchange.trade('buy', opts, cb)
    },

    sell: function (opts, cb) {
      exchange.trade('sell', opts, cb)
    },

    getOrder: function (opts, cb) {
      var order = ws_orders['~' + opts.order_id]

      if (order.status === 'rejected' && order.reject_reason === 'post only') {
        return cb(null, order)
      } else if (order.status === 'rejected' && order.reject_reason === 'zenbot canceled') {
        return cb(null, order)
      }

      if (order.status == "done") {
        order.done_at = new Date().getTime()
        return cb(null, order)
      }

      cb(null, order)
    },

    // return the property used for range querying.
    getCursor: function (trade) {
      return (trade.time || trade)
    }
  }
  return exchange
}
