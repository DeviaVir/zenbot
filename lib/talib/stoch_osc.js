module.exports = function container (get, set, clear) {
  return function stoch_osc (s, key, length) {

    if (s.lookback.length >= length) {
      var low = s.period.low
      var high = s.period.high
      s.lookback.slice(0, length).forEach(function (period) {

        if (!low){
          low = period.low
        } else if (low >= period.low) {
          low = period.low
        }
        if (!high){
          high = period.high
        } else if (high <= period.high) {
          high = period.high
        }
      })
      var closing = s.period.close
      s.period[key] = Math.round(100*(closing - low)/(high - low))
      if (s.options.auto_stoch_osc && s.lookback[0].stoch_osc) {
        get('lib.stddev')(s, 'stoch_osc_stddev', Math.floor(s.options.stoch_osc_periods * 7), 'stoch_osc')
        s.options.overbought_stoch_osc = 50 + (s.period.stoch_osc_stddev)
        s.options.oversold_stoch_osc = 50 - (s.period.stoch_osc_stddev)
      }
    }
  }
}
