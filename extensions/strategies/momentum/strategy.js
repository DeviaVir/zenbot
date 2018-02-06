let z = require('zero-fill')
  , n = require('numbro')
  , momentum = require('../../../lib/momentum')

module.exports = {
  name: 'momentum',
  description: 'MOM = Close(Period) - Close(Length)',

  getOptions: function () {
    this.option('momentum_size', 'number of periods to look back for momentum', Number, 5)
  },

  calculate: function (s) {
    if (s.in_preroll) { return }
    momentum(s, 'mom0', 'close', s.options.momentum_size)
    momentum(s, 'mom1', 'mom0', 1)
  },

  onPeriod: function (s, cb) {
    if (s.in_preroll) {
      cb()
      return
    }

    if (s.period.mom0 > 0 && s.period.mom1 > 0) {
      s.signal = 'buy'
    }
    if (s.period.mom0 < 0 && s.period.mom1 < 0) {
      s.signal = 'sell'
    }
    cb()
  },

  onReport: function (s) {
    let cols = [], color
    if (s.period.mom0 != null) {
      color = s.period.mom0 < 0 ? 'red' : s.period.mom0 > 0 ? 'green' : 'grey'
      cols.push(z(5, n(s.period.mom0).format('000'), ' ')[color])
    } else {
      cols.push(' '.repeat(5))
    }
    if (s.period.mom1 != null) {
      color = s.period.mom1 < 0 ? 'red' : s.period.mom1 > 0 ? 'green' : 'grey'
      cols.push(z(5, n(s.period.mom1).format('000'), ' ')[color])
    } else {
      cols.push(' '.repeat(5))
    }
    return cols
  }
}

