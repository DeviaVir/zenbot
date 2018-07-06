import z from 'zero-fill'
import n from 'numbro'
import tulip_bollinger from '../../../analysis/ti_bollinger'
import * as Phenotypes from '../../../util/phenotype'

export default {
  name: 'ti_bollinger',
  description: 'Buy when (Signal ≤ Lower Bollinger Band) and sell when (Signal ≥ Upper Bollinger Band).',

  getOptions: function() {
    this.option('period', 'period length, same as --period_length', String, '5m')
    this.option('period_length', 'period length, same as --period', String, '5m')
    this.option('bollinger_size', 'period size', Number, 14)
    this.option(
      'bollinger_time',
      'times of standard deviation between the upper band and the moving averages',
      Number,
      2
    )
    this.option(
      'bollinger_upper_bound_pct',
      'pct the current price should be near the bollinger upper bound before we sell',
      Number,
      0
    )
    this.option(
      'bollinger_lower_bound_pct',
      'pct the current price should be near the bollinger lower bound before we buy',
      Number,
      0
    )
  },

  calculate: function(s) {
    if (s.in_preroll) return
  },

  onPeriod: function(s, cb) {
    tulip_bollinger(s, 'tulip_bollinger', s.options.bollinger_size, s.options.bollinger_time)
      .then(function(result: Record<string, any>) {
        if (!result) cb()
        let bollinger = {
          LowerBand: result.LowerBand[result.LowerBand.length - 1],
          MiddleBand: result.MiddleBand[result.MiddleBand.length - 1],
          UpperBand: result.UpperBand[result.UpperBand.length - 1],
        }
        s.period.report = bollinger
        if (bollinger.UpperBand) {
          let upperBound = (bollinger.UpperBand / 100) * (100 - s.options.bollinger_upper_bound_pct)
          let lowerBound = (bollinger.LowerBand / 100) * (100 + s.options.bollinger_lower_bound_pct)
          s.signal = null // hold
          if (s.period.close < lowerBound) {
            s.signal = 'buy'
          }
          if (s.period.close > upperBound) {
            s.signal = 'sell'
          }
        }
        cb()
      })
      .catch(function() {
        s.signal = null // hold
        cb()
      })
  },

  onReport: function(s) {
    var cols = []
    if (s.period.report) {
      if (s.period.report.UpperBand && s.period.report.LowerBand) {
        let upperBound = s.period.report.UpperBand
        let lowerBound = s.period.report.LowerBand
        var color = 'grey'
        if (s.period.close > (upperBound / 100) * (100 - s.options.bollinger_upper_bound_pct)) {
          color = 'green'
        } else if (s.period.close < (lowerBound / 100) * (100 + s.options.bollinger_lower_bound_pct)) {
          color = 'red'
        }
        cols.push(z(8, n(s.period.close).format('+00.0000'), ' ')[color])
        cols.push(
          z(
            8,
            n(lowerBound)
              .format('0.000000')
              .substring(0, 7),
            ' '
          ).cyan
        )
        cols.push(
          z(
            8,
            n(upperBound)
              .format('0.000000')
              .substring(0, 7),
            ' '
          ).cyan
        )
      }
    } else {
      cols.push('         ')
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    markdown_buy_pct: Phenotypes.RangeFactor(-1.0, 5.0, 0.1),
    markup_sell_pct: Phenotypes.RangeFactor(-1.0, 5.0, 0.1),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.RangeFactor(0.0, 50.0, 0.01),
    buy_stop_pct: Phenotypes.RangeFactor(0.0, 50.0, 0.01),
    profit_stop_enable_pct: Phenotypes.RangeFactor(0.0, 5.0, 0.1),
    profit_stop_pct: Phenotypes.RangeFactor(0.0, 20.0, 0.1),
    rsi_periods: Phenotypes.Range(6, 16),

    // -- strategy
    bollinger_size: Phenotypes.RangeFactor(1, 30, 1),
    bollinger_time: Phenotypes.RangeFactor(1.0, 14.0, 0.1),
    bollinger_upper_bound_pct: Phenotypes.RangeFactor(0.0, 100.0, 0.1),
    bollinger_lower_bound_pct: Phenotypes.RangeFactor(0.0, 100.0, 0.1),
  },
}
