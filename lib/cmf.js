// Chaikin Money Flow
module.exports = function container (get, set, clear) {
  return function cmf (s, key, length) {
    if (s.lookback.length >= length) {
      let MFV = 0, SOV = 0;
      s.lookback.slice(0, length).forEach(function(cur) {
          MFV += cur.volume * ((cur.close - cur.low) - (cur.high - cur.close)) / (cur.high - cur.low);
          SOV += cur.volume;
      });
      s.period[key] = MFV / SOV;
    }
  }
}
