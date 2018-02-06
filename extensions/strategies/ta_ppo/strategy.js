var z = require('zero-fill')
  , n = require('numbro')
  , rsi = require('../../../lib/rsi')
  , ta_ppo = require('../../../lib/ta_ppo')

module.exports = {
  name: 'ta_ppo',
  description: 'PPO - Percentage Price Oscillator with rsi oversold',

  getOptions: function () {
    this.option('period', 'period length eg 10m', String, '10m')
    this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('ema_short_period', 'number of periods for the shorter EMA', Number, 12)
    this.option('ema_long_period', 'number of periods for the longer EMA', Number, 26)
    this.option('signal_period', 'number of periods for the signal EMA', Number, 9)
    this.option('ma_type', 'matype of talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3', String, 'SMA')
    this.option('overbought_rsi_periods', 'number of periods for overbought RSI', Number, 25)
    this.option('overbought_rsi', 'sold when RSI exceeds this value', Number, 70)
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

    ta_ppo(s, s.options.ema_long_period, s.options.ema_short_period, s.options.signal_period, s.options.ma_type).then(function(ppoSignal) {
      s.period['ppo'] = ppoSignal

      if (s.period.ppo && s.lookback[0] && s.lookback[0].ppo) {
        s.period.trend_ppo = s.period.ppo >= 0 ? 'up' : 'down'
      }

      if (s.period.trend_ppo == 'up') {
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }

        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
      } else if (s.period.trend_ppo == 'down') {
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

    if (typeof s.period.ppo === 'number') {
      let color = s.period.ppo > 0 ? 'green' : 'red'

      cols.push(z(8, n(s.period.ppo).format('0.0000'), ' ')[color])
    }

    return cols
  }
}

