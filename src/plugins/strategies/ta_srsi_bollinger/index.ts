import z from 'zero-fill'
import n from 'numbro'
import ta_srsi from '../../../analysis/ta_stochrsi'
import ta_bollinger from '../../../analysis/ta_bollinger'
import * as Phenotypes from '../../../util/phenotype'

export default {
  name: 'srsi_bollinger',
  description: 'Stochastic RSI BollingerBand Strategy',

  getOptions: function() {
    this.option('period', 'period length, same as --period_length', String, '5m')
    this.option('period_length', 'period length, same as --period', String, '5m')
    this.option('min_periods', 'min. number of history periods', Number, 200)
    this.option('rsi_periods', 'number of RSI periods', 14)
    this.option('srsi_periods', 'number of Stochastic RSI periods', Number, 9)
    this.option('srsi_k', '%D line', Number, 3)
    this.option('srsi_d', '%D line', Number, 3)
    this.option('srsi_k_sell', 'K must be above this before selling', Number, 60)
    this.option('srsi_k_buy', 'K must be below this before buying', Number, 30)
    this.option('srsi_dType', 'D type mode : SMA,EMA,WMA,DEMA,TEMA,TRIMA,KAMA,MAMA,T3', String, 'SMA'),
      //'SMA','EMA','WMA','DEMA','TEMA','TRIMA','KAMA','MAMA','T3'

      this.option('bollinger_size', 'period size', Number, 14)
    this.option('bollinger_updev', 'Upper Bollinger Time Divisor', Number, 2)
    this.option('bollinger_dndev', 'Lower Bollinger Time Divisor', Number, 2)
    this.option('bollinger_dType', 'mode: : SMA,EMA,WMA,DEMA,TEMA,TRIMA,KAMA,MAMA,T3', String, 'SMA')
    this.option(
      'bollinger_upper_bound_pct',
      'pct the current price should be near the bollinger upper bound before we sell',
      Number,
      1
    )
    this.option(
      'bollinger_lower_bound_pct',
      'pct the current price should be near the bollinger lower bound before we buy',
      Number,
      1
    )
  },

  calculate: function(s) {
    if (s.in_preroll) return
  },

  onPeriod: function(s, cb) {
    //make sure we have all values
    if (s.in_preroll) return cb()

    ta_bollinger(
      s,
      'tabollinger',
      s.options.bollinger_size,
      s.options.bollinger_updev,
      s.options.bollinger_dndev,
      s.options.bollinger_dType
    )
      .then(function(inbol: Record<string, any>) {
        ta_srsi(s, 'srsi', s.options.srsi_periods, s.options.srsi_k, s.options.srsi_d, s.options.srsi_dType)
          .then(function(inres: Record<string, any>) {
            if (!inres) return cb()
            var divergent = inres.outFastK[inres.outFastK.length - 1] - inres.outFastD[inres.outFastD.length - 1]
            s.period.srsi_D = inres.outFastD[inres.outFastD.length - 1]
            s.period.srsi_K = inres.outFastK[inres.outFastK.length - 1]
            var last_divergent = inres.outFastK[inres.outFastK.length - 2] - inres.outFastD[inres.outFastD.length - 2]
            var _switch = 0 //s.lookback[0]._switch
            var nextdivergent = (divergent + last_divergent) / 2 + (divergent - last_divergent)
            if (last_divergent <= 0 && divergent > 0) _switch = 1 // price rising
            if (last_divergent >= 0 && divergent < 0) _switch = -1 // price falling

            s.period.divergent = divergent
            s.period._switch = _switch

            let upperBound = inbol.outRealUpperBand[inbol.outRealUpperBand.length - 1]
            let lowerBound = inbol.outRealLowerBand[inbol.outRealLowerBand.length - 1]
            let midBound = inbol.outRealMiddleBand[inbol.outRealMiddleBand.length - 1]
            if (!s.period.bollinger) s.period.bollinger = {}

            s.period.bollinger.upperBound = upperBound
            s.period.bollinger.lowerBound = lowerBound
            s.period.bollinger.midBound = midBound

            // K is fast moving

            s.signal = null
            if (_switch != 0) {
              if (
                s.period.close > (upperBound / 100) * (100 - s.options.bollinger_upper_bound_pct) &&
                nextdivergent < divergent &&
                _switch == -1 &&
                s.period.srsi_K > s.options.srsi_k_sell
              ) {
                s.signal = 'sell'
              } else if (
                s.period.close < (lowerBound / 100) * (100 + s.options.bollinger_lower_bound_pct) &&
                nextdivergent >= divergent &&
                _switch == 1 &&
                s.period.srsi_K < s.options.srsi_k_buy
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
    if (s.period.bollinger) {
      if (s.period.bollinger.upperBound && s.period.bollinger.lowerBound) {
        let upperBound = s.period.bollinger.upperBound
        let lowerBound = s.period.bollinger.lowerBound
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
        cols.push(
          z(
            8,
            n(s.period.srsi_D)
              .format('0.0000')
              .substring(0, 7),
            ' '
          ).cyan
        )
        cols.push(
          z(
            8,
            n(s.period.srsi_K)
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
      }
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
    rsi_periods: Phenotypes.Range(10, 20),
    srsi_periods: Phenotypes.Range(5, 30),
    srsi_k: Phenotypes.Range(1, 30),
    srsi_d: Phenotypes.Range(1, 30),
    srsi_k_sell: Phenotypes.RangeFactor(0.0, 100.0, 1.0),
    srsi_k_buy: Phenotypes.RangeFactor(0.0, 100.0, 1.0),
    srsi_dType: Phenotypes.ListOption(['SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'TRIMA', 'KAMA', 'MAMA', 'T3']),

    bollinger_size: Phenotypes.RangeFactor(10, 25, 1),
    bollinger_updev: Phenotypes.RangeFactor(1, 3.0, 0.1),
    bollinger_dndev: Phenotypes.RangeFactor(1, 3.0, 0.1),
    bollinger_dType: Phenotypes.ListOption(['SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'TRIMA', 'KAMA', 'MAMA', 'T3']),
    bollinger_upper_bound_pct: Phenotypes.RangeFactor(0.0, 100.0, 1.0),
    bollinger_lower_bound_pct: Phenotypes.RangeFactor(0.0, 100.0, 1.0),
  },
}
