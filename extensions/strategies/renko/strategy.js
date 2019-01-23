var z = require('zero-fill'),
  n = require('numbro')

module.exports = {
  name: 'renko',
  description: 'Renko Reversal Strategy',

  getOptions: function () {
    this.option('period_length', 'period length', String, '15m')
    this.option('min_periods', 'min periods', Number, 200)
    this.option('bricksize', 'Brick Size', Number, 1)
  },

	
  calculate: function (s) {
    if (s.lookback[s.options.min_periods]) {
      var prclose = Math.round(s.lookback[s.options.min_periods].close)
      var propen = Math.round(s.lookback[s.options.min_periods].close)
    }
  },

  onPeriod: function (s, cb) {
    if (s.lookback[s.options.min_periods]) {
		
      // Sources
      prclose = Math.round(s.lookback[s.options.min_periods].close)
      propen = Math.round(s.lookback[s.options.min_periods].close)
      for(var i = 0; i<s.options.min_periods;i++)
      {
        prclose = Math.round(renko_close(s, Math.round(s.lookback[i].close), prclose, propen))
        propen = Math.round(renko_close(s, Math.round(s.lookback[i].close), prclose, propen))
      }
      // Renko
      var rclose = renko_close(s, s.period.close, prclose, propen)
      ropen = renko_open(s, s.period.close, prclose, propen)
      var que
      
      if (rclose > prclose)
        que = 1
      else if (rclose < prclose)
        que = -1
      else
        que = 0

      if (que > 0) 
      {
        if (s.trend != 'up')
        {
          s.signal = 'buy'
        }
        s.trend = 'up'
      }
      else if (que < 0) 
      {
        if (s.trend != 'down')
        {
          s.signal = 'sell'
        }
        s.trend = 'down'
      }
      else
      {
        s.trend= 'null'
      }
    }
    cb()
  },

  onReport: function (s) {
    var cols = []
    if (s.lookback[s.options.min_periods]) {
      cols.push(z(8, n(prclose), ' '))
      cols.push(z(1, ' '))
      cols.push(z(8, n(rclose), ' '))
      cols.push(z(1, ' '))
      cols.push(z(8, s.trend, ' '))
    }
    return cols
  }
}

function renko_close(s, close, prclose, propen){
  var type = s.options.bricksize*2	
  if (close > (prclose + type)) 
  {
    if (prclose > propen)
    {	
      return (prclose + s.options.bricksize) 
    }
    else 
    {
      return (prclose + type)
    }
  }
  else if (close < (prclose - type))
  {
    if (prclose < propen)
    {
      return (prclose - s.options.bricksize)
    }
    else
    { 
      return (prclose - type)
    }
  } 
  else 
  {
    return (prclose)
  }
}
	
function renko_open(s,close,prclose,propen)
{
  var type = s.options.bricksize*2
  if (close > prclose) 
  {
    if (prclose > propen)
    {	
      return(prclose) 
    }
    else 
    {
      return(prclose + type)
    }
  }
  else if (close < prclose)
  {
    if (prclose < propen)
    {
      return(prclose)
    }
    else
    { 
      return(prclose - type)
    }
  } 
  else 
  {
    return(propen)
  }
}
