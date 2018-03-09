// Linear Regression Curve
var bollingerbands = require('bollinger-bands')
module.exports = function bollinger (s, key, length, source_key) {
  if (!source_key) source_key = 'close'
  if (s.lookback.length > length) {
    let data = []
    for (var i=length-1; i>=0; i--) {
      data.push(s.lookback[i][source_key])
    }
    let result = bollingerbands(data, length, s.options.bollinger_time)
    s.period[key] = result
  }
}

