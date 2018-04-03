// Keltner Channels
var keltnerchannel = require('keltnerchannel').kc
module.exports = function kc (s, key, length, source_key) {
  if (!source_key) source_key = 'close'
  if (s.lookback.length > length) {
    let data = []
    for (var i=length-1; i>=0; i--) {
      data.push({
        high: s.lookback[i].high,
        low: s.lookback[i].low,
        close: s.lookback[i].close
      })
    }
    let result = keltnerchannel(data, s.options.kc_size, s.options.kc_multiplier)
    s.period[key] = result
  }
}

