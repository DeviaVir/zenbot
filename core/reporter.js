var colors = require('colors')
  , n = require('numbro')
  , o = require('object-get')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var apply_funcs = get('utils.apply_funcs')
  var reporter_cols = c.reporter_cols.map(function (i) {
    return get('reporter_cols.' + i)
  })
  return function reporter (tick, cb) {
    if (!tick.data.trades) return cb()
    var rs = get('run_state')
    var g = {
      tick: tick,
      cols: []
    }
    apply_funcs(g, reporter_cols, function (err, g) {
      if (err) return cb(err)
      get('logger').info('reporter', g.cols.join(' '))
      cb()
    })
  }
}