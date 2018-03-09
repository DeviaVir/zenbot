module.exports = function wto (s, key, length, source_key) {
  if (!source_key) source_key = 'close'

  let ema = function(x, y, p) {
    let alpha = (2 / (y + 1) )
    let ema = (x - p) * alpha + p
    return ema
  }

  if (!s.period['wto_d']) s.period['wto_d'] = 0
  if (!s.period['wto_esa']) s.period['wto_esa'] = 0
  if (!s.period[key]) s.period[key] = 0

  if (s.lookback.length >= length) {
    let ap = (s.period['close'] + s.period['high'] + s.period['low']) / 3
    s.period['hcl3'] = ap

    var prev_esa = s.lookback[0]['wto_esa']
    if (typeof prev_esa !== 'undefined' && ! isNaN(prev_esa)) {
      let esa = ema(ap, length, prev_esa)
      s.period['wto_esa'] = esa

      var prev_d = s.lookback[0]['wto_d']
      if (typeof prev_d !== 'undefined' && ! isNaN(prev_d)) {
        let d = ema(Math.abs(ap - esa), length, prev_d)
        s.period['wto_d'] = d

        let ci = (ap - esa) / (0.015 * d)

        var prev_tci = s.lookback[0][key]
        if (typeof prev_tci !== 'undefined' && ! isNaN(prev_tci)) {
          let tci = ema(ci, s.options.wavetrend_average_length, prev_tci)
          s.period[key] = tci
        }
      }
    }
  }
}

