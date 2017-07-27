module.exports = function container (get, set, clear) {
  return {
    name: 'noop',
    description: 'Just do nothing. Can be used to e.g. generate candlesticks for training the genetic forex strategy.',

    getOptions: function () {
      this.option('period', 'period length', String, '30m')
    },

    calculate: function (s) {
    },

    onPeriod: function (s, cb) {
      cb()
    },

    onReport: function (s) {
      var cols = []
      return cols
    }
  }
}
