module.exports = function container (get, set, clear) {
  var apply_funcs = get('utils.apply_funcs')
  var rs = get('run_state')
  var defaults = {
    asset: 0,
    currency: 1000,
    start_balance: 1000,
    side: null,
    period_vol: 0,
    running_vol: 0,
    running_total: 0,
    high: 0,
    low: 10000,
    vol: 0,
    max_diff: 0,
    buy_price: null,
    sell_price: null,
    trade_vol: 0,
    cooldown: 0,
    last_tick: null,
    vol_diff_string: '',
    last_hour: null,
    hour_vol: 0,
    first_tick: null,
    num_trades: 0,
    volatility: 0,
    max_vol: 0,
    last_learned: null,
    net_worth: null
  }
  Object.keys(defaults).forEach(function (k) {
    if (typeof rs[k] === 'undefined') {
      rs[k] = defaults[k]
    }
  })
  return {
    see: function (tick, cb) {
      if (!rs.first_tick) rs.first_tick = tick
      rs.last_tick = tick
      var tasks = get('sensors')
      apply_funcs(tick, tasks, function (err) {
        if (err) return cb(err)
        cb()
      })
    },
    think: function (cb) {
      var tasks = get('thinkers')
      apply_funcs(rs, tasks, function (err) {
        if (err) return cb(err)
        cb()
      })
    }
  }
}