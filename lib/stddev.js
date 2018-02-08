module.exports = function stddev (s, key, length, source_key) {
  if (typeof s.period[source_key] === 'number') {
    var sum = s.period[source_key]
    var sum_len = 1
    for (var idx = 0; idx < length; idx++) {
      if (typeof s.lookback[idx][source_key] === 'number') {
        sum += s.lookback[idx][source_key]
        sum_len++
      }
      else {
        break
      }
    }
    var avg = sum / sum_len
    var var_sum = 0
    for (idx = 0; idx < sum_len - 1; idx++) {
      var_sum += Math.pow(s.lookback[idx][source_key] - avg, 2)
    }
    var variance = var_sum / sum_len
    s.period[key] = Math.sqrt(variance)
  }
}
