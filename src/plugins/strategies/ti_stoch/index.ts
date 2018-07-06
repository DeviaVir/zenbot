import z from 'zero-fill'
import n from 'numbro'
import tulip_stoch from '../../../analysis/ti_stoch'
import * as Phenotypes from '../../../util/phenotype'

export default {
  name: 'ti_stoch',
  description:
    'Buy when (Signal ≤ srsi_k_buy) and sell when (Signal ≥ srsi_k_sell).  (this should not be used alone.  you will lose over time)',

  getOptions: function() {
    this.option('period', 'period length, same as --period_length', String, '5m')
    this.option('period_length', 'period length, same as --period', String, '5m')
    this.option('rsi_periods', 'number of RSI periods', 14)
    this.option('stoch_kperiods', 'number of RSI periods', Number, 9)
    this.option('stoch_k', '%D line', Number, 3)
    this.option('stoch_d', '%D line', Number, 3)
    this.option('stoch_k_sell', 'K must be above this before selling', Number, 80)
    this.option('stoch_k_buy', 'K must be below this before buying', Number, 10)
  },

  calculate: function(s) {
    if (s.in_preroll) return
  },

  onPeriod: function(s, cb) {
    if (s.in_preroll) return cb()
    tulip_stoch(s, 'tulip_stoch', s.options.rsi_periods, s.options.stoch_k, s.options.stoch_d)
      .then(function(result: Record<string, any>) {
        if (!result) return cb()
        if (result.k.length == 0) return cb()
        var divergent = result.k[result.k.length - 1] - result.d[result.d.length - 1]
        s.period.srsi_D = result.d[result.d.length - 1]
        s.period.srsi_K = result.k[result.k.length - 1]
        var last_divergent = result.k[result.k.length - 2] - result.d[result.d.length - 2]
        var _switch = 0 //s.lookback[0]._switch
        var nextdivergent = (divergent + last_divergent) / 2 + (divergent - last_divergent)
        if (last_divergent <= 0 && divergent > 0) _switch = 1 // price rising
        if (last_divergent >= 0 && divergent < 0) _switch = -1 // price falling

        s.period.divergent = divergent
        s.period._switch = _switch

        s.signal = null
        if (_switch != 0) {
          if (_switch == -1 && s.period.srsi_K > s.options.stoch_k_sell) {
            s.signal = 'sell'
          } else if (nextdivergent >= divergent && _switch == 1 && s.period.srsi_K < s.options.stoch_k_buy) {
            s.signal = 'buy'
          }
        }

        return cb()
      })
      .catch(function() {
        s.signal = null // hold
        return cb()
      })
  },

  onReport: function(s) {
    var cols = []

    cols.push(z(8, n(s.period.close).format('+00.0000'), ' ').cyan)
    cols.push(
      z(
        8,
        n(s.period.srsi_D)
          .format('0.000000')
          .substring(0, 7),
        ' '
      ).cyan
    )
    cols.push(
      z(
        8,
        n(s.period.srsi_K)
          .format('0.000000')
          .substring(0, 7),
        ' '
      ).cyan
    )
    cols.push(
      z(
        8,
        n(s.period.divergent)
          .format('0')
          .substring(0, 3),
        ' '
      ).cyan
    )
    cols.push(
      z(
        8,
        n(s.period._switch)
          .format('0')
          .substring(0, 2),
        ' '
      ).cyan
    )

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

    // -- strategy
    rsi_periods: Phenotypes.Range(10, 30),
    stoch_periods: Phenotypes.Range(5, 30),
    stoch_k: Phenotypes.Range(1, 10),
    stoch_d: Phenotypes.Range(1, 10),
    stoch_k_sell: Phenotypes.RangeFactor(0.0, 100.0, 1.0),
    stoch_k_buy: Phenotypes.RangeFactor(0.0, 100.0, 1.0),
  },
}
