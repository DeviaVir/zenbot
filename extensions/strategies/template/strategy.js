var z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    name: 'template-strategy',
    description: 'Your awsome strategy description'


    getOptions: function () {
      // build-in
      this.option('period', 'period length in  minutes', String, '10m')

      // Working globals
      this.option('initialized', 'period length in  minutes', Boolean, false)
    },


    // --------------------INITIALIZATION---------------------
    // -------------------------------------------------------
    initialize: function(s){
      // Your initialization goes here..

    },


    // --------------------CALCULATE--------------------------
    // -------------------------------------------------------
    // Called every time when a trade was done (for example if in 5min period was done 20 trades, the method will be called 20 times)
    calculate: function (s) {

      if(!s.options.initialized)
        s.options.initialize(s)
      //get('lib.ema')(s, 'ma30', 30/periodInMinutes)
    },


    // --------------------ON PERIOD--------------------------
    // -------------------------------------------------------
    // Called on every period specified in s.options.period
    onPeriod: function (s, cb) {

      cb()
    },


    // --------------------ON REPORT--------------------------
    // -------------------------------------------------------
    // Called on every report interval s.options.balance_snapshot_period
    onReport: function (s) {
      var cols = []
      if (typeof s.period.macd_histogram === 'number') {
        var color = 'grey'
        if (s.period.macd_histogram > 0) {
          color = 'green'
        }
        else if (s.period.macd_histogram < 0) {
          color = 'red'
        }
        cols.push(z(8, n(s.period.macd_histogram).format('+00.0000'), ' ')[color])
        cols.push(z(8, n(s.period.overbought_rsi).format('00'), ' ').cyan)
      }
      else {
        cols.push('         ')
      }
      return cols
    }
  }
}
