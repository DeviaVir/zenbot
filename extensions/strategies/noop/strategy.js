module.exports = {
  name: 'noop',
  description: 'Just do nothing. Can be used to e.g. generate candlesticks for training the genetic forex strategy.',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '30m')
    this.option('period_length', 'period length, same as --period', String, '30m')
  },

  calculate: function () {
  },

  onPeriod: function (s, cb) {
    cb()
  },

  onReport: function () {
    var cols = []
    return cols
  }
}

