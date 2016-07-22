module.exports = function container (get, set, clear) {
  var log_trades = get('utils.log_trades')
  var c = get('constants')
  var process_trades = get('process_trades')
  var idle = false
  return function reduce_trades () {
    get('motley:db.trades').select({query: {processed: false}, limit: c.trade_reducer_limit}, function (err, trades) {
      if (err) {
        if (get('app').closing) return
        throw err
      }
      var timeout
      if (!trades.length) {
        idle = true
        //get('logger').info('trade reducer', 'idle'.grey)
        timeout = setTimeout(reduce_trades, trades.length ? 0 : c.tick)
        set('timeouts[]', timeout)
      }
      else {
        process_trades(trades, function (err) {
          if (err) {
            if (get('app').closing) return
            throw err
          }
          idle = false
          log_trades('trade reducer', trades)
          timeout = setTimeout(reduce_trades, trades.length ? 0 : c.tick)
          set('timeouts[]', timeout)
        })
      }
    })
  }
}