module.exports = function vwap (s, key, length, max_period, source_key) {
  if (!source_key) source_key = 'close'
    
  if (s.lookback.length >= length) {
    if(!s.vwap){
      s.vwap = 0, 
      s.vwapMultiplier = 0, 
      s.vwapDivider = 0,
      s.vwapCount = 0
    }
      
    if(max_period && s.vwapCount > max_period){
      s.vwap = 0, 
      s.vwapMultiplier = 0, 
      s.vwapDivider = 0,
      s.vwapCount = 0
    }
      
    s.vwapMultiplier = s.vwapMultiplier + parseFloat(s.period[source_key]) * parseFloat(s.period['volume'])
    s.vwapDivider = s.vwapDivider + parseFloat(s.period['volume'])
      
    s.period[key] = s.vwap = s.vwapMultiplier / s.vwapDivider
      
    s.vwapCount++
  }
}

