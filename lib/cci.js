module.exports = function cci (s, key, length, c) {
  s.period['TP'] = (s.period.high + s.period.low + s.period.close) / 3
  if (s.lookback.length >= length) {
    let avg_TP = s.lookback
      .slice(0, length)
      .reduce((sum, tp) => {
        return sum + tp.TP
      }, 0)
    s.period['avg_TP'] = avg_TP / length
    let meanDev = s.lookback
      .slice(0, length)
      .reduce((sum, cur) => {
        cur = Math.abs(cur.TP - s.period.avg_TP)
        return sum + cur
      }, 0)
    meanDev = meanDev / length
    let CCI = (s.period.TP - s.period.avg_TP) / (c * meanDev)
    s.period[key] = CCI
  }
}


/*
CCI = (Typical Price  -  20-period SMA of TP) / (.015 x Mean Deviation)

Typical Price (TP) = (High + Low + Close)/3

Constant = .015

There are four steps to calculating the Mean Deviation. First, subtract the most recent 20-period average of the typical price from each period's
typical price. Second, take the absolute values of these numbers. Third,
sum the absolute values. Fourth, divide by the total number of periods (20).
*/
