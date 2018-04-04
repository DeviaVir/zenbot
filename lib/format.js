let n = require('numbro')

let max_fc_width = 0
module.exports = {
  formatAsset: function formatAsset (amt, asset) {
    return n(amt).format('0.00000000') + ' ' + asset
  },
  formatPercent: function formatPercent (ratio) {
    return (ratio >= 0 ? '+' : '') + n(ratio).format('0.00%')
  },
  formatCurrency: function formatCurrency (amt, currency, omit_currency, color_trick, do_pad) {
    let str
    let fstr
    amt > 999 ? fstr = '0.00' :
      amt > 99 ? fstr = '0.000' :
        amt > 9 ? fstr = '0.0000' :
          amt > 0.9 ? fstr = '0.00000' :
            amt > 0.09 ? fstr = '0.000000' :
              amt > 0.009 ? fstr = '0.0000000' :
                fstr = '0.00000000'
    str = n(amt).format(fstr)
    if (do_pad) {
      max_fc_width = Math.max(max_fc_width, str.length)
      str = ' '.repeat(max_fc_width - str.length) + str
    }
    if (color_trick) {
      str = str
        .replace(/^(.*\.)(.*?)(0*)$/, function (_, m1, m2, m3) {
          return m1.cyan + m2.yellow + m3.grey
        })
    }
    return str + (omit_currency ? '' : ' ' + currency)
  }
}