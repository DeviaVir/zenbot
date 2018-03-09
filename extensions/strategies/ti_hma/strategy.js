var z = require('zero-fill')
  , n = require('numbro')
  , rsi = require('../../../lib/rsi')
  , ti_hma = require('../../../lib/ti_hma')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'ti_hma',
  description: 'HMA - Hull Moving Average',

  getOptions: function () {
    this.option('period', 'period length eg 10m', String, '15m')
    this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('trend_hma', 'number of periods for trend hma', Number, 36)
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

    ti_hma(s, s.options.min_periods, s.options.trend_hma).then(function(signal) {
      s.period['trend_hma'] = signal

      // percentage change
      if (s.period.trend_hma && s.lookback[0] && s.lookback[0].trend_hma) {
        s.period.trend_hma_rate = (s.period.trend_hma - s.lookback[0].trend_hma) / s.lookback[0].trend_hma * 100
      }

      if (s.period.trend_hma_rate > 0) {
        if (s.trend !== 'up') {
          s.acted_on_trend = false
        }
        s.trend = 'up'
        s.signal = !s.acted_on_trend ? 'buy' : null
        s.cancel_down = false
      } else if (!s.cancel_down && s.period.trend_hma_rate < 0) {
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
    var cols = []

    if (typeof s.period.trend_hma === 'number') {
      var color = 'grey'

      if (s.period.trend_hma_rate > 0) {
        color = 'green'
      } else if (s.period.trend_hma_rate < 0) {
        color = 'red'
      }

      cols.push(z(8, n(s.period.trend_hma).format('0.0000'), ' ')[color])
      cols.push(z(6, n(s.period.trend_hma_rate).format('0.00'), ' ')[color])
    }

    return cols
  },

  phenotypes: {
    period_length: Phenotypes.RangePeriod(5, 120, 'm'),
    min_periods: Phenotypes.Range(20, 104),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    trend_hma: Phenotypes.Range(6, 72),
    overbought_rsi_periods: Phenotypes.Range(1, 50),
    overbought_rsi: Phenotypes.Range(20, 100)
  }
}

