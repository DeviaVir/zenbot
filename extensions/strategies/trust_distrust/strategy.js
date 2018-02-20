var z = require('zero-fill')
  , n = require('numbro')

module.exports = {
  name: 'trust_distrust',
  description: 'Sell when price higher than $sell_min% and highest point - $sell_threshold% is reached. Buy when lowest price point + $buy_threshold% reached.',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '30m')
    this.option('period_length', 'period length, same as --period', String, '30m')
    this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('sell_threshold', 'sell when the top drops at least below this percentage', Number, 2)
    this.option('sell_threshold_max', 'sell when the top drops lower than this max, regardless of sell_min (panic sell, 0 to disable)', Number, 0)
    this.option('sell_min', 'do not act on anything unless the price is this percentage above the original price', Number, 1)
    this.option('buy_threshold', 'buy when the bottom increased at least above this percentage', Number, 2)
    this.option('buy_threshold_max', 'wait for multiple buy signals before buying (kill whipsaw, 0 to disable)', Number, 0)
    this.option('greed', 'sell if we reach this much profit (0 to be greedy and either win or lose)', Number, 0)
  },

  calculate: function (s) {
    if (typeof s.trust_distrust_start_greed === 'undefined') {
      s.trust_distrust_start_greed = s.period.high
    }
    if (typeof s.trust_distrust_start === 'undefined') {
      s.trust_distrust_start = s.period.high
    }
    if (typeof s.trust_distrust_highest === 'undefined') {
      s.trust_distrust_highest = s.period.high
    }
    if (typeof s.trust_distrust_lowest === 'undefined') {
      s.trust_distrust_lowest = s.period.high
    }
    if (typeof s.trust_distrust_last_action === 'undefined') {
      s.trust_distrust_last_action = null
    }
    if (typeof s.trust_distrust_buy_threshold_max === 'undefined') {
      s.trust_distrust_buy_threshold_max = 0
    }

    // when our current price is higher than what we recorded, overwrite
    if (s.period.high > s.trust_distrust_highest) {
      s.trust_distrust_highest = s.period.high
    }

    // when our current price is lower than what we recorded, overwrite
    if (s.trust_distrust_lowest > s.period.high) {
      s.trust_distrust_lowest = s.period.high
    }
  },

  onPeriod: function (s, cb) {
    if (s.greedy) {
      s.signal = s.trust_distrust_last_action
      return cb()
    }

    // sell logic
    if (s.trust_distrust_last_action !== 'sell') {
      if ( s.period.high > (s.trust_distrust_start + (s.trust_distrust_start / 100 * s.options.sell_min))) { // we are above minimum we want to sell for, or going so low we should "panic sell"
        if (s.period.high < (s.trust_distrust_highest - (s.trust_distrust_highest / 100 * s.options.sell_threshold))) { // we lost sell_threshold from highest point
          s.signal = 'sell'

          s.trust_distrust_last_action = 'sell'
          s.trust_distrust_start = s.period.high
          s.trust_distrust_highest = s.period.high
          s.trust_distrust_lowest = s.period.high

          return cb()
        }
      }

      if (s.options.sell_threshold_max > 0 && s.period.high < (s.trust_distrust_highest - (s.trust_distrust_highest / 100 * s.options.sell_threshold_max))) { // we panic sell
        s.signal = 'sell'

        s.trust_distrust_last_action = 'sell'
        s.trust_distrust_start = s.period.high
        s.trust_distrust_highest = s.period.high
        s.trust_distrust_lowest = s.period.high

        return cb()
      }
    }

    if (s.options.greed > 0 && s.period.high > (s.trust_distrust_start_greed + (s.trust_distrust_start_greed / 100 * s.options.greed))) { // we are not greedy, sell if this profit is reached
      s.signal = 'sell'

      s.trust_distrust_last_action = 'sell'
      s.trust_distrust_start = s.period.high
      s.trust_distrust_highest = s.period.high
      s.trust_distrust_lowest = s.period.high
      s.greedy = true

      return cb()
    }

    // buy logic
    if (s.trust_distrust_last_action !== 'buy') {
      if(s.period.high < s.trust_distrust_start && s.period.high > (s.trust_distrust_lowest + (s.trust_distrust_lowest / 100 * s.options.buy_threshold))) { // we grew above buy threshold from lowest point
        if (s.options.buy_threshold_max > 0 && s.trust_distrust_buy_threshold_max < s.options.buy_threshold_max) {
          s.trust_distrust_buy_threshold_max++
          return cb()
        }
        s.trust_distrust_buy_threshold_max = 0
        s.signal = 'buy'

        s.trust_distrust_last_action = 'buy'
        s.trust_distrust_start = s.period.high
        s.trust_distrust_highest = s.period.high
        s.trust_distrust_lowest = s.period.high

        return cb()
      }
    }

    // repeat last signal
    if (s.signal === null) {
      s.signal = s.trust_distrust_last_action
    }
    return cb()
  },

  onReport: function (s) {
    var cols = []
    var color = 'grey'
    if (s.period.high > s.trust_distrust_start) {
      color = 'green'
    }
    else if (s.period.high < s.trust_distrust_lowest) {
      color = 'red'
    }
    cols.push(z(8, n(s.period.high).format('0.0000'), ' ')[color])
    cols.push(z(8, n(s.trust_distrust_start).format('0.0000'), ' ').grey)
    return cols
  }
}

