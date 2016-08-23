var colors = require('colors')
  , n = require('numbro')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  var o = get('utils.object_get')
  return function reporter_col (g, cb) {
    var c = get('config')
    var tick = g.tick, rs = g.rs
    if (!rs.market_price) {
      g.cols.push(' '.repeat(c.ansi_graph_width))
      return cb()
    }
    var rsi_tick_id = tb(tick.time).resize(c.rsi_reporter_size).toString()
    get('ticks').load(get('app_name') + ':' + rsi_tick_id, function (err, rsi_tick) {
      if (err) return cb(err)
      var rsi = o(rsi_tick || {}, rs.selector + '.rsi')
      if (rsi) {
        var half = c.ansi_graph_width / 2
        var bar = ''
        try {
          if (rsi.value > 50) {
            bar += ' '.repeat(half)
            var stars = Math.min(Math.round((rsi.value / 100) * half), half)
            bar += '+'.repeat(stars).green.bgGreen
            bar += ' '.repeat(half - stars)
          }
          else if (rsi.value < 50) {
            var stars = Math.min(Math.round(((100 - rsi.value) / 100) * half), half)
            bar += ' '.repeat(half - stars)
            bar += '-'.repeat(stars).red.bgRed
            bar += ' '.repeat(half)
          }
          else {
            bar += ' '.repeat(half * 2)
          }
          rs.max_sma_diff = n(rs.max_sma_diff).subtract(n(rs.max_sma_diff).multiply(c.ansi_graph_decay)).value()
        }
        catch (e) {
          bar = ' '.repeat(c.ansi_graph_width)
        }
        g.cols.push(bar)
      }
      else {
        g.cols.push(' '.repeat(c.ansi_graph_width))
      }
      cb()
    })
  }
}