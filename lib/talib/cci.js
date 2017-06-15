// CCI = (Typical Price  -  20-period SMA of TP) / (.015 x Mean Deviation)

// Typical Price (TP) = (High + Low + Close)/3

// Constant = .015

// There are four steps to calculating the Mean Deviation. First, subtract the most recent 20-period average of the typical price from each period's
// typical price. Second, take the absolute values of these numbers. Third,
// sum the absolute values. Fourth, divide by the total number of periods (20).
module.exports = function container (get, set, clear) {
  return function cci (s, key, length) {
    if (s.lookback.length >= length) {
      var prev_tp = s.lookback[0].typ_price
      if (!prev_tp) {
        var sum = 0
        s.lookback.slice(0, length).forEach(function (period) {
          sum += period.typ_price
        })
        prev_tp = sum / length
      }
      var md_sum = 0
      s.lookback.slice(0, length).forEach(function (period) {
        md_sum += Math.abs(period.typ_price - prev_tp)
      })
      var mean_dev = md_sum / (length)
      s.period[key] = (s.period.typ_price - prev_tp) / (0.015 * mean_dev)
      if (s.options.auto_cci && s.lookback[0].cci) {
        get('lib.stddev')(s, 'cci_stddev', Math.floor(s.options.cci_periods * 7), 'cci')
        s.options.overbought_cci = 50 + (.8 * s.period.cci_stddev)
        s.options.oversold_cci = 50 - (.8 * s.period.cci_stddev)
      }
    }
  }
}


