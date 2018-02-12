var z = require('zero-fill')
  , n = require('numbro')
  , rsi = require('../../../lib/rsi')
  , ultosc = require('../../../lib/ta_ultosc')

module.exports = {
  name: 'ta_ultosc',
  description: 'ULTOSC - Ultimate Oscillator with rsi oversold',

  getOptions: function () {
    this.option('period', 'period length eg 10m', String, '5m')
    this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('timeperiod1', 'talib ULTOSC timeperiod1', Number, 7)
    this.option('timeperiod2', 'talib ULTOSC timeperiod2', Number, 14)
    this.option('timeperiod3', 'talib ULTOSC timeperiod3', Number, 28)
    this.option('overbought_rsi_periods', 'number of periods for overbought RSI', Number, 25)
    this.option('overbought_rsi', 'sold when RSI exceeds this value', Number, 90)
  },

  calculate: function (s) {
    if (s.options.overbought_rsi) {
      // sync RSI display with overbought RSI periods
      s.options.rsi_periods = s.options.overbought_rsi_periods
      rsi(s, 'overbought_rsi', s.options.overbought_rsi_periods)
      if (!s.in_preroll && s.period.overbought_rsi >= s.options.overbought_rsi && !s.overbought) {
        s.overbought = true

        if (s.options.mode === 'sim' && s.options.verbose) {
          console.log(('\noverbought at ' + s.period.overbought_rsi + ' RSI, preparing to sold\n').cyan)
        }
      }
    }
  },

  onPeriod: function (s, cb) {
    if (!s.in_preroll && typeof s.period.overbought_rsi === 'number') {
      if (s.overbought) {
        s.overbought = false
        s.signal = 'sell'
        return cb()
      }
    }

    ultosc(s, s.options.min_periods, s.options.timeperiod1, s.options.timeperiod2, s.options.timeperiod3).then(function(signal) {
      s.period['ultosc'] = signal

      if (s.period.ultosc) {
        if(s.period.ultosc < 30) {
          s.period.trend_ultosc = 'down'
        } else if(s.period.ultosc > 70) {
          s.period.trend_ultosc = 'up'
        }
      }

      if (s.period.trend_ultosc == 'up') {
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }

        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
      } else if (s.period.trend_ultosc == 'down') {
        if (s.trend !== 'down') {
          s.acted_on_trend = false
        }

        s.trend = 'down'
        s.signal = !s.acted_on_trend ? 'sell' : null
      }

      cb()
    }).catch(function(error) {
      console.log(error)
      cb()
    })
  },

  onReport: function (s) {
    let cols = []

    if (typeof s.period.ultosc === 'number') {
      let color = s.trend == 'up' ? 'green' : 'red'

      cols.push(z(8, n(s.period.ultosc).format('0.0000'), ' ')[color])
    }

    return cols
  }
}

