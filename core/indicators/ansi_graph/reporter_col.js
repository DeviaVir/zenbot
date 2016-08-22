var colors = require('colors')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var z = get('utils.zero_fill')
  return function reporter_col (g, cb) {
    var c = get('config')
    var tick = g.tick, rs = g.rs
    var sma = rs.sma
    if (!sma || !rs.market_price) {
      g.cols.push(' '.repeat(c.ansi_graph_width))
      return cb()
    }
    rs.sma_diff = n(rs.market_price)
      .subtract(sma.value)
      .value()
    rs.max_sma_diff = rs.max_sma_diff ? Math.max(rs.max_sma_diff, Math.abs(rs.sma_diff)) : rs.sma_diff
    var half = c.ansi_graph_width / 2
    var bar = ''
    if (rs.sma_diff > 0) {
      bar += ' '.repeat(half)
      var stars = Math.min(Math.round((rs.sma_diff / rs.max_sma_diff) * half), half)
      bar += '+'.repeat(stars).green.bgGreen
      bar += ' '.repeat(half - stars)
    }
    else if (rs.sma_diff < 0) {
      var stars = Math.min(Math.round((Math.abs(rs.sma_diff) / rs.max_sma_diff) * half), half)
      bar += ' '.repeat(half - stars)
      bar += '-'.repeat(stars).red.bgRed
      bar += ' '.repeat(half)
    }
    else {
      bar += ' '.repeat(half * 2)
    }
    rs.max_sma_diff = n(rs.max_sma_diff).subtract(n(rs.max_sma_diff).multiply(c.ansi_graph_decay)).value()
    g.cols.push(bar)
    cb()
  }
}