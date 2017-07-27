let z = require('zero-fill')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  return {
    name: 'srsi_macd',
    description: 'Stochastic MACD Strategy',

    getOptions: function () {
      this.option('period', 'period length', String, '30m')
      this.option('min_periods', 'min. number of history periods', Number, 200)
      this.option('rsi_periods', 'number of RSI periods', 14)
      this.option('srsi_periods', 'number of RSI periods', Number, 9)
      this.option('srsi_k', '%D line', Number, 5)
      this.option('srsi_d', '%D line', Number, 3)
      this.option('oversold_rsi', 'buy when RSI reaches or drops below this value', Number, 20)
      this.option('overbought_rsi', 'sell when RSI reaches or goes above this value', Number, 80)
      this.option('ema_short_period', 'number of periods for the shorter EMA', Number, 24)
      this.option('ema_long_period', 'number of periods for the longer EMA', Number, 200)
      this.option('signal_period', 'number of periods for the signal EMA', Number, 9)
      this.option('up_trend_threshold', 'threshold to trigger a buy signal', Number, 0)
      this.option('down_trend_threshold', 'threshold to trigger a sold signal', Number, 0)
    },

    calculate: function (s) {
		// compute Stochastic RSI
		get('lib.srsi')(s, 'srsi', s.options.rsi_periods, s.options.srsi_k, s.options.srsi_d)

        // compute MACD
        get('lib.ema')(s, 'ema_short', s.options.ema_short_period)
        get('lib.ema')(s, 'ema_long', s.options.ema_long_period)
        if (s.period.ema_short && s.period.ema_long) {
          s.period.macd = (s.period.ema_short - s.period.ema_long)
          get('lib.ema')(s, 'signal', s.options.signal_period, 'macd')
          if (s.period.signal) {
            s.period.macd_histogram = s.period.macd - s.period.signal
          }
        }
    },

    onPeriod: function (s, cb) {
    	if (!s.in_preroll)
			if (typeof s.period.macd_histogram === 'number' && typeof s.lookback[0].macd_histogram === 'number' && typeof s.period.srsi_K === 'number' && typeof s.period.srsi_D === 'number')
				// Buy signal
        		if (s.period.macd_histogram >= s.options.up_trend_threshold)
					if (s.period.srsi_K > s.period.srsi_D && s.period.srsi_K > s.lookback[0].srsi_K && s.period.srsi_K < s.options.oversold_rsi)
						s.signal = 'buy'

				// Sell signal
				if (s.period.macd_histogram < s.options.down_trend_threshold)
					if (s.period.srsi_K < s.period.srsi_D && s.period.srsi_K < s.lookback[0].srsi_K && s.period.srsi_K > s.options.overbought_rsi)
						s.signal = 'sell'

				// Hold
				//s.signal = null;
		cb()
    },
    onReport: function (s) {
      var cols = []
      if (typeof s.period.macd_histogram === 'number') {
        var color = 'grey'
        if (s.period.macd_histogram > 0) {
          color = 'green'
        }
        else if (s.period.macd_histogram < 0) {
          color = 'red'
        }
        cols.push(z(8, n(s.period.macd_histogram).format('+00.0000'), ' ')[color])
        cols.push(z(8, n(s.period.srsi_K).format('000'), ' ').cyan)
      }
      else {
        cols.push('         ')
      }
      return cols
    }
	}
}
