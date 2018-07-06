import CEX from 'cexio-api-node'
import path from 'path'
import n from 'numbro'
import minimist from 'minimist'
import _ from 'lodash'
import * as debug from '../../../engine/debug'

export default (conf) => {
  let s = {
    options: minimist(process.argv),
  }
  let so = s.options

  let public_client, authed_client, ws_client, ws_authed, ws_subscribed, amount_format
  let ws_trades = []
  let orders = {}

  function publicClient() {
    if (!public_client) {
      public_client = new CEX().rest
    }
    return public_client
  }

  function authedClient() {
    if (!authed_client) {
      if (!conf.cexio || !conf.cexio.username || !conf.cexio.key || conf.cexio.key === 'YOUR-API-KEY') {
        throw new Error('please configure your CEX.IO credentials in ' + path.resolve(__dirname, 'conf.js'))
      }
      authed_client = new CEX(conf.cexio.username, conf.cexio.key, conf.cexio.secret).rest
    }
    return authed_client
  }

  function joinProduct(product_id) {
    return product_id.split('-')[0] + '/' + product_id.split('-')[1]
  }

  function retry(method, args) {
    debug.msg(('CEX.IO API is down! unable to call ' + method + ', retrying in 10s').red)
    setTimeout(function() {
      exchange[method].apply(exchange, args)
    }, 10000)
  }

  function refreshFees(args) {
    let skew = 5000 // in ms
    let now = new Date()
    let nowUTC = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    ).getTime()

    let midnightUTC = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    ).setHours(24, 0, 0, 0)

    let countdown = midnightUTC - nowUTC + skew
    if (debug.on) {
      let hours = Math.round((countdown / (1000 * 60 * 60)) % 24)
      let minutes = Math.round((countdown / (1000 * 60)) % 60)
      let seconds = Math.round((countdown / 1000) % 60)
      debug.msg('Refreshing fees in ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds')
    }
    setTimeout(function() {
      exchange['setFees'].apply(exchange, args)
    }, countdown)
  }

  function wsClient() {
    return new Promise(function(resolve, reject) {
      if (!ws_client) {
        if (!conf.cexio || !conf.cexio.key || conf.cexio.key === 'YOUR-API-KEY') {
          throw new Error('please configure your CEX.IO credentials in ' + path.resolve(__dirname, 'conf.js'))
        }
        ws_client = new CEX(conf.cexio.key, conf.cexio.secret).ws
        ws_client.open()
        ws_client.on('open', function() {
          debug.msg('WebSocket connected')
          ws_client.auth()
          ws_client.on('auth', function() {
            debug.msg('WebSocket authenticated')
            ws_authed = true
            resolve(ws_client)
          })
        })
        ws_client.on('message', function(msg) {
          switch (msg.e) {
            case 'disconnecting':
              debug.msg('WebSocket disconnecting:' + msg.reason)
              break
            case 'ping':
              ws_client.send({ e: 'pong' }) // Heartbeat
              break
            case 'get-balance':
              ws_client.emit('balance', msg.data)
              break
            case 'ticker':
              ws_client.emit('ticker', msg.data)
              break
            case 'history':
              ws_client.emit('history', msg.data)
              break
            case 'history-update':
              msg.data.forEach(function(trade) {
                ws_trades.push({
                  trade_id: Number(trade[4]),
                  time: Number(trade[1]),
                  size: Number(
                    n(trade[2])
                      .divide(amount_format)
                      .format('0.00000000')
                  ),
                  price: Number(trade[3]),
                  side: trade[0],
                })
              })
              break
            case 'cancel-order':
              ws_client.emit('cancelOrder', msg.data)
              break
            case 'place-order':
              ws_client.emit('placeOrder', msg.data)
              break
            case 'get-order':
              ws_client.emit('getOrder', msg.data)
              break
          }
        })
        ws_client.on('error', function(err) {
          console.error('WebSocket error:', err)
        })
        ws_client.on('close', function() {
          ws_client = null
          ws_authed = false
          ws_subscribed = false
          debug.msg('WebSocket disconnected')
        })
      } else {
        switch (ws_client.ws.readyState) {
          case 0:
            reject('WebSocket connecting')
            break
          case 1:
            if (ws_authed) {
              resolve(ws_client)
            } else {
              reject('WebSocket auth pending')
            }
            break
          case 2:
            reject('WebSocket closing')
            break
          case 3:
            reject('WebSocket closed')
            break
        }
      }
    })
  }

  function wsTrades(pair) {
    return new Promise(function(resolve, reject) {
      wsClient()
        .then(function(client: Record<string, any>) {
          client.send({
            e: 'subscribe',
            rooms: ['pair-' + pair],
          })
          client.once('history', function(trades) {
            resolve(trades)
          })
        })
        .catch(function(err) {
          reject(err)
        })
    })
  }

  function wsBalance() {
    return new Promise(function(resolve, reject) {
      wsClient()
        .then(function(client: Record<string, any>) {
          client.getBalance()
          client.once('balance', function(balance) {
            if (balance.error) {
              reject(balance.error)
            } else {
              resolve(balance)
            }
          })
        })
        .catch(function(err) {
          reject(err)
        })
    })
  }

  function wsQuote(pair) {
    return new Promise(function(resolve, reject) {
      wsClient()
        .then(function(client: Record<string, any>) {
          client.authTicker(pair)
          client.once('ticker', function(quote) {
            if (quote.error) {
              reject(quote.error)
            } else {
              resolve(quote)
            }
          })
        })
        .catch(function(err) {
          reject(err)
        })
    })
  }

  function wsCancelOrder(order_id) {
    return new Promise(function(resolve, reject) {
      wsClient()
        .then(function(client: Record<string, any>) {
          client.cancelOrder(order_id)
          client.once('cancelOrder', function(order) {
            if (order.error) {
              reject(order.error)
            } else {
              resolve()
            }
          })
        })
        .catch(function(err) {
          reject(err)
        })
    })
  }

  function wsTrade(order) {
    return new Promise(function(resolve, reject) {
      wsClient()
        .then(function(client: Record<string, any>) {
          client.placeOrder(order.type, order.pair, order.size, order.price)
          client.once('placeOrder', function(order) {
            if (order.error) {
              reject(order.error)
            } else {
              resolve(order)
            }
          })
        })
        .catch(function(err) {
          reject(err)
        })
    })
  }

  function wsGetOrder(order_id) {
    return new Promise(function(resolve, reject) {
      wsClient()
        .then(function(client: Record<string, any>) {
          client.getOrder(order_id)
          client.once('getOrder', function(order) {
            if (order.error) {
              reject(order.error)
            } else {
              resolve(order)
            }
          })
        })
        .catch(function(err) {
          reject(err)
        })
    })
  }

  let exchange = {
    name: 'cexio',
    historyScan: 'forward',
    backfillRateLimit: 0,
    makerFee: 0.16,
    takerFee: 0.25,
    dynamicFees: true,
    makerBuy100Workaround: true,

    getProducts: function() {
      return require('./products.json')
    },

    getTrades: function(opts, cb) {
      let func_args = [].slice.call(arguments)
      if (so._[2] === 'backfill') {
        // Backfill using REST
        let client = publicClient()
        let pair = joinProduct(opts.product_id)
        client.trade_history(pair, opts.from, function(err, body) {
          if (err || (typeof body === 'string' && body.match(/error/))) {
            debug.msg(('getTrades ' + (err ? err : body)).red)
            return retry('getTrades', func_args)
          }
          let trades = body.map(function(trade) {
            return {
              trade_id: Number(trade.tid),
              time: Number(trade.date) * 1000,
              size: Number(trade.amount),
              price: Number(trade.price),
              side: trade.type,
            }
          })
          cb(null, trades)
        })
      } else {
        // WebSocket once Live
        if (!ws_subscribed)
          wsTrades(opts.product_id)
            .then(function(data: any[]) {
              ws_subscribed = true
              amount_format = opts.product_id.split('-')[0] === 'ETH' ? 1000000 : 100000000 // trade amount is an unformatted integer
              data.forEach(function(trade) {
                let t = trade.split(':')
                ws_trades.push({
                  trade_id: Number(t[4]),
                  time: Number(t[1]),
                  size: Number(
                    n(t[2])
                      .divide(amount_format)
                      .format('0.00000000')
                  ),
                  price: Number(t[3]),
                  side: t[0],
                })
              })
            })
            .catch(function(err) {
              debug.msg(('getTrades ' + err).red)
              return retry('getTrades', func_args)
            })
        _.remove(ws_trades, function(t) {
          return t.trade_id <= opts.from
        })
        cb(null, ws_trades)
      }
    },

    getBalance: function(opts, cb) {
      let func_args = [].slice.call(arguments)
      wsBalance()
        .then(function(data: Record<string, any>) {
          let ws_balance = {
            currency: n(data.balance[opts.currency]).format('0.00000000'),
            asset: n(data.balance[opts.asset]).format('0.00000000'),
            currency_hold: n(data.obalance[opts.currency]).format('0.00000000'),
            asset_hold: n(data.obalance[opts.asset]).format('0.00000000'),
          }
          cb(null, ws_balance)
        })
        .catch(function(err) {
          debug.msg(('getBalance ' + err).red)
          return retry('getBalance', func_args)
        })
    },

    getQuote: function(opts, cb) {
      let func_args = [].slice.call(arguments)
      wsQuote(opts.product_id)
        .then(function(data: Record<string, any>) {
          let ws_ticker = {
            ask: data.ask,
            bid: data.bid,
          }
          cb(null, ws_ticker)
        })
        .catch(function(err) {
          debug.msg(('getQuote ' + err).red)
          return retry('getQuote', func_args)
        })
    },

    cancelOrder: function(opts, cb) {
      let func_args = [].slice.call(arguments)
      wsCancelOrder(opts.order_id)
        .then(function() {
          cb()
        })
        .catch(function(err) {
          debug.msg(('cancelOrder ' + err).red)
          if (err !== 'Error: Order not found') return retry('cancelOrder', func_args)
        })
    },

    trade: function(action, opts, cb) {
      let func_args = [].slice.call(arguments)
      if (opts.order_type === 'taker') {
        // Looks like WebSocket doesn't support taker/market orders (yet?)
        delete opts.price
        delete opts.post_only
        if (action === 'buy') {
          opts.size = n(opts.size)
            .multiply(opts.orig_price)
            .value() // CEXIO estimates asset size and uses free currency to performe margin buy
        }
        let client = authedClient()
        client.place_order(joinProduct(opts.product_id), action, opts.size, opts.price, 'market', function(err, body) {
          if (err || (typeof body === 'string' && body.match(/error/))) {
            debug.msg(('trade ' + (err ? err : body)).red)
            if (body === 'error: Error: Place order error: Insufficient funds.') {
              let order = {
                status: 'rejected',
                reject_reason: 'balance',
              }
              return cb(null, order)
            } else {
              return retry('trade', func_args)
            }
          } else {
            let order = {
              id: body.id,
              status: 'open',
              price: opts.price,
              size: opts.size,
              post_only: !!opts.post_only,
              created_at: body.time,
              filled_size: '0',
              ordertype: 'taker',
            }
            orders['~' + body.id] = order
            cb(null, order)
          }
        })
      } else {
        wsTrade({
          type: action,
          pair: opts.product_id,
          size: opts.size,
          price: opts.price,
        })
          .then(function(data: Record<string, any>) {
            let order = {
              id: data.id,
              status: 'open',
              price: data.price,
              size: data.amount,
              post_only: !!opts.post_only,
              created_at: data.time,
              filled_size: data.amount - data.pending,
              ordertype: 'maker',
            }
            orders['~' + data.id] = order
            cb(null, order)
          })
          .catch(function(err) {
            debug.msg(('trade ' + err).red)
            return retry('trade', func_args)
          })
      }
    },

    buy: function(opts, cb) {
      exchange.trade('buy', opts, cb)
    },

    sell: function(opts, cb) {
      exchange.trade('sell', opts, cb)
    },

    getOrder: function(opts, cb) {
      let func_args = [].slice.call(arguments)
      let order = orders['~' + opts.order_id]
      wsGetOrder(opts.order_id)
        .then(function(data: Record<string, any>) {
          if (data.status === 'c') {
            order.status = 'rejected'
            order.reject_reason = 'canceled'
          } else if (data.status === 'd' || data.status === 'cd') {
            order.status = 'done'
            order.done_at = new Date().getTime()
            order.filled_size = n(data.amount)
              .subtract(data.remains)
              .format('0.00000000')
          }
          cb(null, order)
        })
        .catch(function(err) {
          debug.msg(('getOrder ' + err).red)
          return retry('getOrder', func_args)
        })
    },

    setFees: function(opts) {
      let func_args = [].slice.call(arguments)
      let client = authedClient()
      client.get_my_fee(function(err, body) {
        if (err || (typeof body === 'string' && body.match(/error/))) {
          debug.msg(('setFees ' + (err ? err : body) + ' - using fixed fees!').red)
          return retry('setFees', func_args)
        } else {
          let pair = opts.asset + ':' + opts.currency
          let makerFee = (parseFloat(body[pair].buyMaker) + parseFloat(body[pair].sellMaker)) / 2
          let takerFee = (parseFloat(body[pair].buy) + parseFloat(body[pair].sell)) / 2
          if (exchange.makerFee != makerFee) {
            debug.msg('Maker fee changed: ' + exchange.makerFee + '% -> ' + makerFee + '%')
            exchange.makerFee = makerFee
          }
          if (exchange.takerFee != takerFee) {
            debug.msg('Taker fee changed: ' + exchange.takerFee + '% -> ' + takerFee + '%')
            exchange.takerFee = takerFee
          }
        }
        return refreshFees(func_args)
      })
    },

    // return the property used for range querying.
    getCursor: function(trade) {
      return trade.trade_id
    },
  }
  return exchange
}
