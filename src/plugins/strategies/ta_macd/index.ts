import z from 'zero-fill'
import n from 'numbro'
import rsi from '../../../analysis/rsi'
import ema from '../../../analysis/ema'
import * as Phenotypes from '../../../util/phenotype'

export default {
  name: 'ta_macd',
  description: 'Buy when (MACD - Signal > 0) and sell when (MACD - Signal < 0).',

  getOptions: function() {
    this.option('period', 'period length, same as --period_length', String, '1h')
    this.option('period_length', 'period length, same as --period', String, '1h')
    this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('ema_short_period', 'number of periods for the shorter EMA', Number, 12)
    this.option('ema_long_period', 'number of periods for the longer EMA', Number, 26)
    this.option('signal_period', 'number of periods for the signal EMA', Number, 9)
    this.option('up_trend_threshold', 'threshold to trigger a buy signal', Number, 0)
    this.option('down_trend_threshold', 'threshold to trigger a sold signal', Number, 0)
  },

  calculate: function(s) {
    const { ema_long_period, ema_short_period, signal_period, rsi_periods } = s.options

    rsi(s, 'rsi', rsi_periods)

    ema(s, 'ema_short', ema_short_period)
    ema(s, 'ema_long', ema_long_period)

    if (s.period.ema_short && s.period.ema_long) {
      s.period.macd = s.period.ema_short - s.period.ema_long
      ema(s, 'signal', signal_period, 'macd')
      if (s.period.signal) {
        s.period.macd_histogram = s.period.macd - s.period.signal

        const {
          lookback: [lookback],
          period: { macd_histogram },
          options: { up_trend_threshold, down_trend_threshold },
        } = s

        if (typeof macd_histogram === 'number' && typeof lookback.macd_histogram === 'number') {
          if (macd_histogram - up_trend_threshold > 0 && lookback.macd_histogram - up_trend_threshold <= 0) {
            s.signal = 'buy'
          } else if (macd_histogram + down_trend_threshold < 0 && lookback.macd_histogram + down_trend_threshold >= 0) {
            s.signal = 'sell'
          } else {
            s.signal = null // hold
          }
        }
      }
    }
  },

  onPeriod: function(s, cb) {
    cb()
  },

  onReport: function(s) {
    var cols = []
    if (typeof s.period.macd_histogram === 'number') {
      var color = 'grey'
      if (s.period.macd_histogram > 0) {
        color = 'green'
      } else if (s.period.macd_histogram < 0) {
        color = 'red'
      }
      cols.push(z(8, n(s.period.macd_histogram).format('+00.0000'), ' ')[color])
    } else {
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
    profit_stop_pct: Phenotypes.Range(1, 20),

    // -- strategy
    // have to be minimum 2 because talib will throw an "TA_BAD_PARAM" error
    ema_short_period: Phenotypes.Range(2, 20),
    ema_long_period: Phenotypes.Range(20, 100),
    signal_period: Phenotypes.Range(1, 20),
    up_trend_threshold: Phenotypes.Range(0, 50),
    down_trend_threshold: Phenotypes.Range(0, 50),
    rsi_periods: Phenotypes.Range(1, 50),
    overbought_rsi: Phenotypes.Range(20, 100),
    oversold_rsi: Phenotypes.Range(20, 100),
  },
}
