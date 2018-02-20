module.exports = function sar(s, key, initAccel, deltaAccel, accelMax) {

  if (s.lookback.length < 2) {
    return
  }

  // SAR#
  if (!s.lookback[0][key + '_sar#']) {
    s.period[key + '_sar#'] = -1
  } else {
    if (s.lookback[0][key + '_sar#'] < 0) {
      if (s.period[key + '_tsar'] < s.period.high)
        s.period[key + '_sar#'] = 1
      else
        s.period[key + '_sar#'] = s.lookback[0][key + '_sar#'] - 1
    } else {
      if (s.period[key + '_tsar'] > s.period.low)
        s.period[key + '_sar#'] = -1
      else
        s.period[key + '_sar#'] = s.lookback[0][key + '_sar#'] + 1
    }
  }

  // EP
  if (s.period[key + '_sar#'] < 0) {
    if (s.period[key + '_sar#'] == -1) {
      s.period[key + '_ep'] = s.period.low
    } else {
      s.period[key + '_ep'] = Math.min(s.period.low, s.lookback[0][key + '_ep'])
    }
  } else {
    if (s.period[key + '_sar#'] == 1) {
      s.period[key + '_ep'] = s.period.high
    } else {
      s.period[key + '_ep'] = Math.max(s.period.high, s.lookback[0][key + '_ep'])
    }
  }

  // AF
  if (Math.abs(s.period[key + '_sar#']) == 1) {
    s.period[key + '_af'] = initAccel
  } else if (s.period[key + '_ep'] == s.lookback[0][key + '_ep']) {
    s.period[key + '_af'] = s.lookback[0][key + '_af']
  } else {
    s.period[key + '_af'] = Math.min(accelMax, deltaAccel + s.lookback[0][key + '_af'])
  }

  // tentative sar
  if (s.lookback[0][key + '_sar#'] < 0) {
    s.period[key + '_tsar'] = Math.max(s.lookback[0][key] + s.lookback[0][key + '_af'] * (s.lookback[0][key + '_ep'] - s.lookback[0][key]), s.lookback[0].high, s.lookback[1].high)
  } else {
    s.period[key + '_tsar'] = Math.min(s.lookback[0][key] + s.lookback[0][key + '_af'] * (s.lookback[0][key + '_ep'] - s.lookback[0][key]), s.lookback[0].low, s.lookback[1].low)
  }

  // SAR
  if (!s.lookback[0][key]) {
    if (s.period[key + '_sar#'] < 0) {
      s.period[key] = s.lookback[0].high
    } else {
      s.period[key] = s.lookback[0].low
    }
  } else if (s.period[key + '_sar#'] == -1) {
    s.period[key] = Math.max(s.lookback[0][key + '_ep'], s.period.high)
  } else if (s.period[key + '_sar#'] == 1) {
    s.period[key] = Math.min(s.lookback[0][key + '_ep'], s.period.low)
  } else {
    s.period[key] = s.period[key + '_tsar']
  }
}

