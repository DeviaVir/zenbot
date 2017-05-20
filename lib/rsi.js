module.exports = function container (get, set, clear) {
  return function rsi (s, key, length) {
    if (s.lookback.length >= length) {
      var avg_gain = s.lookback[0][key + '_avg_gain']
      var avg_loss = s.lookback[0][key + '_avg_loss']
      if (typeof avg_gain === 'undefined') {
        var gain_sum = 0
        var loss_sum = 0
        var last_close
        s.lookback.slice(0, length).forEach(function (period) {
          if (last_close) {
            if (period.close > last_close) {
              gain_sum += period.close - last_close
            }
            else {
              loss_sum += last_close - period.close
            }
          }
          last_close = period.close
        })
        s.period[key + '_avg_gain'] = gain_sum / length
        s.period[key + '_avg_loss'] = loss_sum / length
      }
      else {
        var current_gain = s.period.close - s.lookback[0].close
        s.period[key + '_avg_gain'] = ((avg_gain * (length - 1)) + (current_gain > 0 ? current_gain : 0)) / length
        var current_loss = s.lookback[0].close - s.period.close
        s.period[key + '_avg_loss'] = ((avg_loss * (length - 1)) + (current_loss > 0 ? current_loss : 0)) / length
      }
      var rs = s.period[key + '_avg_gain'] / s.period[key + '_avg_loss']
      s.period[key] = Math.round(100 - (100 / (1 + rs)))
    }
  }
}