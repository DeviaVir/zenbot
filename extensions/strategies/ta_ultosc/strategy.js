var z = require('zero-fill')
  , n = require('numbro')
  , rsi = require('../../../lib/rsi')
  , ultosc = require('../../../lib/ta_ultosc')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'ta_ultosc',
  description: 'ULTOSC - Ultimate Oscillator with rsi oversold',

  getOptions: function () {
    this.option('period', 'period length eg 5m', String, '5m')
    this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('signal', 'Provide signal and indicator "simple" (buy@65, sell@50), "low" (buy@65, sell@30), "trend" (buy@30, sell@70)', String, 'simple')
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

      let t = s.signales || {}

      var signals = {
        bottom: t.bottom || 0, // 30 line
        top: t.top || 0, // 70 line
      }

      if (s.period.ultosc && s.period.ultosc > 0) {

        if (s.options.signal == 'simple') {
          // use defensive indicator trigger

          if (s.period.ultosc > 65) {
            s.period.trend_ultosc = 'up'
          } else if (s.period.ultosc < 50) {
            s.period.trend_ultosc = 'down'
          }

        } else if (s.options.signal == 'low') {
          // use recovery indicator trigger

          if(s.period.ultosc > 65) {
            s.period.trend_ultosc = 'up'
          } else if(s.period.ultosc < 30 && signals.bottom == 0) {
            s.period.trend_ultosc = 'down'
          }
        } else if (s.options.signal == 'trend') {
          // lets got with the masses

          if(s.period.ultosc > 30 && signals.bottom > 0) {
            s.period.trend_ultosc = 'up'
          } else if(s.period.ultosc < 70 && signals.top > 0) {
            s.period.trend_ultosc = 'down'
          }
        }

        signals.bottom = s.period.ultosc < 30 ? signals.bottom + 1 : 0
        signals.top = s.period.ultosc > 70 ? signals.top + 1 : 0

        s.signales = signals
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
      let signal = z(8, n(s.period.ultosc).format('0.0000'), ' ')

      if (s.period.ultosc <= 30) {
        cols.push(signal.red)
      } else if (s.period.ultosc > 30 && s.period.ultosc <= 50) {
        cols.push(signal.yellow)
      } else if (s.period.ultosc > 50 && s.period.ultosc < 70) {
        cols.push(signal.green)
      } else if (s.period.ultosc >= 70) {
        cols.push(signal.bold.green)
      }
    }

    return cols
  },

  phenotypes: {
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    min_periods: Phenotypes.Range(1, 104),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    signal: Phenotypes.ListOption(['simple', 'low', 'trend']),
    timeperiod1: Phenotypes.Range(1,50),
    timeperiod2: Phenotypes.Range(1,50),
    timeperiod3: Phenotypes.Range(1,50),
    overbought_rsi_periods: Phenotypes.Range(1, 50),
    overbought_rsi: Phenotypes.Range(20, 100)
  }
}

