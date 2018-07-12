import z from 'zero-fill'
import n from 'numbro'
import ti_stoch from '../../../analysis/ti_stoch'
import ti_bollinger from '../../../analysis/ti_bollinger'
import * as Phenotypes from '../../../util/phenotype'

export default {
  name: 'ti_stoch_bollinger',
  description: 'Stochastic BollingerBand Strategy',

  getOptions: function() {
    this.option('period', 'period length, same as --period_length', String, '5m')
    this.option('period_length', 'period length, same as --period', String, '5m')
    this.option('min_periods', 'min. number of history periods', Number, 200)
    this.option('rsi_periods', 'number of RSI periods', 14)
    this.option('stoch_kperiods', 'number of RSI periods', Number, 9)
    this.option('stoch_k', '%D line', Number, 5)
    this.option('stoch_d', '%D line', Number, 3)
    this.option('stoch_k_sell', 'K must be above this before selling', Number, 70)
    this.option('stoch_k_buy', 'K must be below this before buying', Number, 20)

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
    //make sure we have all values
    if (s.in_preroll) return cb()

    ti_bollinger(s, 'ti_bollinger', s.options.bollinger_size, s.options.bollinger_time)
      .then(function(inbol: Record<string, any>) {
        ti_stoch(s, 'ti_stoch', s.options.stoch_kperiods, s.options.stoch_k, s.options.stoch_d)
          .then(function(inres: Record<string, any>) {
            if (!inres) return cb()
            if (inres.k.length == 0) return cb()
            var divergent = inres.k[inres.k.length - 1] - inres.d[inres.d.length - 1]
            s.period.stoch_D = inres.d[inres.d.length - 1]
            s.period.stoch_K = inres.k[inres.k.length - 1]
            var last_divergent = inres.k[inres.k.length - 2] - inres.d[inres.d.length - 2]
            var _switch = 0
            var nextdivergent = (divergent + last_divergent) / 2 + (divergent - last_divergent)
            if (last_divergent <= 0 && divergent > 0) _switch = 1 // price rising
            if (last_divergent >= 0 && divergent < 0) _switch = -1 // price falling

            s.period.divergent = divergent
            s.period._switch = _switch

            let LowerBand = inbol.LowerBand[inbol.LowerBand.length - 1]
            let MiddleBand = inbol.MiddleBand[inbol.MiddleBand.length - 1]
            let UpperBand = inbol.UpperBand[inbol.UpperBand.length - 1]
            let bollinger = {
              LowerBand: LowerBand,
              MiddleBand: MiddleBand,
              UpperBand: UpperBand,
            }
            s.period.report = bollinger

            // K is fast moving

            s.signal = null
            if (_switch != 0) {
              if (
                s.period.close >= MiddleBand &&
                s.period.close >= (UpperBand / 100) * (100 + s.options.bollinger_upper_bound_pct) &&
                nextdivergent < divergent &&
                _switch == -1 &&
                s.period.stoch_K > s.options.stoch_k_sell
              ) {
                s.signal = 'sell'
              } else if (
                s.period.close < (LowerBand / 100) * (100 + s.options.bollinger_lower_bound_pct) &&
                nextdivergent >= divergent &&
                _switch == 1 &&
                s.period.stoch_K < s.options.stoch_k_buy
              ) {
                s.signal = 'buy'
              }
            }

            cb()
          })
          .catch(function() {
            cb()
          })
      })
      .catch(function() {
        cb()
      })
  },

  onReport: function(s) {
    var cols = []
    if (s.period.report) {
      let upperBound = s.period.report.UpperBand
      let lowerBound = s.period.report.LowerBand
      var color = 'grey'
      if (s.period.close > (upperBound / 100) * (100 + s.options.bollinger_upper_bound_pct)) {
        color = 'green'
      }
      if (s.period.close < (lowerBound / 100) * (100 - s.options.bollinger_lower_bound_pct)) {
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
      cols.push(
        z(
          8,
          n(s.period.stoch_D)
            .format('0.0000')
            .substring(0, 7),
          ' '
        ).cyan
      )
      cols.push(
        z(
          8,
          n(s.period.stoch_K)
            .format('0.0000')
            .substring(0, 7),
          ' '
        ).cyan
      )
      cols.push(
        z(
          5,
          n(s.period.divergent)
            .format('0')
            .substring(0, 7),
          ' '
        ).cyan
      )
      cols.push(
        z(
          2,
          n(s.period._switch)
            .format('0')
            .substring(0, 2),
          ' '
        ).cyan
      )
    } else {
      cols.push('         ')
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.ListOption(['1m', '2m', '3m', '4m', '5m', '10m', '15m']), //, '10m','15m','30m','45m','60m'
    min_periods: Phenotypes.Range(52, 150),
    markdown_buy_pct: Phenotypes.RangeFactor(-1.0, 1.0, 0.1),
    markup_sell_pct: Phenotypes.RangeFactor(-1.0, 1.0, 0.1),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.RangeFactor(0.0, 50.0, 0.1),
    buy_stop_pct: Phenotypes.RangeFactor(0.0, 50.0, 0.1),
    profit_stop_enable_pct: Phenotypes.RangeFactor(0.0, 5.0, 0.1),
    profit_stop_pct: Phenotypes.RangeFactor(0.0, 50.0, 0.1),

    // -- strategy
    rsi_periods: Phenotypes.Range(10, 30),
    stoch_periods: Phenotypes.Range(5, 30),
    stoch_k: Phenotypes.Range(1, 10),
    stoch_d: Phenotypes.Range(1, 10),
    stoch_k_sell: Phenotypes.RangeFactor(0.0, 100.0, 1.0),
    stoch_k_buy: Phenotypes.RangeFactor(0.0, 100.0, 1.0),

    bollinger_size: Phenotypes.RangeFactor(10, 25, 1),
    bollinger_time: Phenotypes.RangeFactor(1, 3.0, 0.1),
    bollinger_upper_bound_pct: Phenotypes.RangeFactor(0.0, 100.0, 1.0),
    bollinger_lower_bound_pct: Phenotypes.RangeFactor(0.0, 100.0, 1.0),
  },
}
