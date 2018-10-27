let z = require('zero-fill')
  , n = require('numbro')
  , srsi = require('../../../lib/srsi')
  , ema = require('../../../lib/ema')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'srsi_macd',
  description: 'Stochastic MACD Strategy',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '30m')
    this.option('period_length', 'period length, same as --period', String, '30m')
    this.option('min_periods', 'min. number of history periods', Number, 200)
    this.option('rsi_periods', 'number of RSI periods', Number, 14)
    this.option('srsi_periods', 'number of RSI periods', Number, 9)
    this.option('srsi_k', '%D line', Number, 5)
    this.option('srsi_d', '%D line', Number, 3)
    this.option('oversold_rsi', 'buy when RSI reaches or drops below this value', Number, 20)
    this.option('overbought_rsi', 'sell when RSI reaches or goes above this value', Number, 80)
    this.option('ema_short_period', 'number of periods for the shorter EMA', Number, 24)
    this.option('ema_long_period', 'number of periods for the longer EMA', Number, 200)
    this.option('signal_period', 'number of periods for the signal EMA', Number, 9)
    this.option('up_trend_threshold', 'threshold to trigger a buy signal', Number, 0)
    this.option('down_trend_threshold', 'threshold to trigger a sold signal', Number, 0)
  },

  calculate: function (s) {
    // compute Stochastic RSI
    srsi(s, 'srsi', s.options.rsi_periods, s.options.srsi_k, s.options.srsi_d)

    // compute MACD
    ema(s, 'ema_short', s.options.ema_short_period)
    ema(s, 'ema_long', s.options.ema_long_period)
    if (s.period.ema_short && s.period.ema_long) {
      s.period.macd = (s.period.ema_short - s.period.ema_long)
      ema(s, 'signal', s.options.signal_period, 'macd')
      if (s.period.signal) {
        s.period.macd_histogram = s.period.macd - s.period.signal
      }
    }
  },

  onPeriod: function (s, cb) {
    if (!s.in_preroll)
      if (typeof s.period.macd_histogram === 'number' && typeof s.lookback[0].macd_histogram === 'number' && typeof s.period.srsi_K === 'number' && typeof s.period.srsi_D === 'number')
      // Buy signal
        if (s.period.macd_histogram >= s.options.up_trend_threshold)
          if (s.period.srsi_K > s.period.srsi_D && s.period.srsi_K > s.lookback[0].srsi_K && s.period.srsi_K < s.options.oversold_rsi)
            s.signal = 'buy'

    // Sell signal
    if (s.period.macd_histogram < s.options.down_trend_threshold)
      if (s.period.srsi_K < s.period.srsi_D && s.period.srsi_K < s.lookback[0].srsi_K && s.period.srsi_K > s.options.overbought_rsi)
        s.signal = 'sell'

    // Hold
    //s.signal = null;
    cb()
  },
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
      cols.push(z(8, n(s.period.srsi_K).format('00.00'), ' ').cyan)
      cols.push(z(8, n(s.period.srsi_D).format('00.00'), ' ').yellow)
    }
    else {
      cols.push('         ')
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    min_periods: Phenotypes.Range(1, 200),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    rsi_periods: Phenotypes.Range(1, 200),
    srsi_periods: Phenotypes.Range(1, 200),
    srsi_k: Phenotypes.Range(1, 50),
    srsi_d: Phenotypes.Range(1, 50),
    oversold_rsi: Phenotypes.Range(1, 100),
    overbought_rsi: Phenotypes.Range(1, 100),
    ema_short_period: Phenotypes.Range(1, 20),
    ema_long_period: Phenotypes.Range(20, 100),
    signal_period: Phenotypes.Range(1, 20),
    up_trend_threshold: Phenotypes.Range(0, 20),
    down_trend_threshold: Phenotypes.Range(0, 20)
  }
}
