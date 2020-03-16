// Bollinger Bands
var bollingerbands = require('bollinger-bands')

module.exports = function bollinger (s, key, length, source_key) {
  if (!source_key) source_key = 'close'
  if (s.lookback.length > length) {
    // skip calculation if result already presented as we use historical data only,
    // no need to recalculate for each individual trade
    if (key in s.period) return
    let data = []
    for (var i=length-1; i>=0; i--) {
      data.push(s.lookback[i][source_key])
    }
    const result = bollingerbands(data, length, s.options.bollinger_time)
    const upperBound = result.upper[result.upper.length-1]
    const lowerBound = result.lower[result.lower.length-1]
    const midBound = result.mid[result.mid.length-1]
    const simple_result = {
      upperBound : upperBound,
      midBound: midBound,
      lowerBound : lowerBound
    }
    s.period[key] = simple_result
  }
}

