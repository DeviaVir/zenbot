module.exports = function container (get, set, clear) {
  return function midprice (s, key, length,low='low',high='high') {
    if (s.lookback.length <= length)return;
    if (typeof s.period[low] === 'number' && typeof s.period[high] === 'number') {
      var min = s.period[low]
      var max = s.period[high]
      for (var idx = 0; idx < length; idx++) {
        if (typeof s.lookback[idx][low] === 'number' && typeof s.lookback[idx][high] === 'number') {
          max = Math.max(s.lookback[idx][high],max)
          min = Math.min(s.lookback[idx][low],min)
        }
      }
      s.period[key] = (max+min)/2;
    }
  }
}