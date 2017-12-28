// Linear Regression Curve
var regression = require('regression')
module.exports = function container (get, set, clear) {
  return function lrc (s, key, length, source_key) {
    if (!source_key) source_key = 'close'
    if (s.lookback.length > length) {
        let data = [];
        for (var i=length-1; i>=0; i--) {
            data.push([length-1-i, s.lookback[i][source_key]]);
        }
        let result = regression.linear(data);
        s.period[key] = result.equation[1] + result.equation[0]*(length-1);
    }   
  }
}
