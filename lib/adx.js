// ADX + DI
module.exports = function adx (s, key, length) {
  if (s.lookback[0] != undefined) {
    let TrueRange = Math.max(Math.max(s.period.high-s.period.low, Math.abs(s.period.high-s.lookback[0].close)), 
      Math.abs(s.period.low-s.lookback[0].close))
    let DirectionalMovementPlus = s.period.high-s.lookback[0].high > s.lookback[0].low-s.period.low ? 
      Math.max(s.period.high-s.lookback[0].high, 0): 0
    let DirectionalMovementMinus = s.lookback[0].low-s.period.low > s.period.high-s.lookback[0].high ? 
      Math.max(s.lookback[0].low-s.period.low, 0): 0
            
    s.period['SmoothedTrueRange'] = (s.lookback[0]['SmoothedTrueRange'] == undefined) ? TrueRange :
      s.lookback[0]['SmoothedTrueRange'] - s.lookback[0]['SmoothedTrueRange']/length + TrueRange
    s.period['SmoothedDirectionalMovementPlus'] = (s.lookback[0]['SmoothedDirectionalMovementPlus'] == undefined) ? DirectionalMovementPlus :
      s.lookback[0]['SmoothedDirectionalMovementPlus'] - s.lookback[0]['SmoothedDirectionalMovementPlus']/length + DirectionalMovementPlus
    s.period['SmoothedDirectionalMovementMinus'] = (s.lookback[0]['SmoothedDirectionalMovementMinus'] == undefined) ? DirectionalMovementMinus :
      s.lookback[0]['SmoothedDirectionalMovementMinus'] - s.lookback[0]['SmoothedDirectionalMovementMinus']/length + DirectionalMovementMinus
            
    s.period['DIPlus'] = s.period['SmoothedDirectionalMovementPlus'] / s.period['SmoothedTrueRange'] * 100
    s.period['DIMinus'] = s.period['SmoothedDirectionalMovementMinus'] / s.period['SmoothedTrueRange'] * 100
  }
  if (s.lookback.length > length) {
    let ADX = s.lookback
      .slice(0, length)
      .reduce((sum, cur) => {
        let DX = Math.abs(cur['DIPlus']-cur['DIMinus']) / (cur['DIPlus']+cur['DIMinus'])*100
        return sum + DX
      }, 0)

    s.period[key] = ADX / length
  }
}

