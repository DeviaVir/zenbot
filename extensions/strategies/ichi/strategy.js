var z = require('zero-fill')
, n = require('numbro')

/**
 * Calculate if the Kumo can be reversed (sideway market or kumo twist)
 * */
function isReversable(s){
	var kumo_size = s.period.close*0.005;
	//last_kumo = Math.abs(s.period.ssa-s.period.ssb)<kumo_size
	cur_kumo = Math.abs(s.lookback[25].ssa-s.lookback[25].ssb)<kumo_size ;
	if(/*last_kumo||*/cur_kumo)console.log('Kumo : '+cur_kumo+' '+kumo_size);
	return /*last_kumo || */cur_kumo;
}
/**
 * Just try to get a short trend
 * @param {*} s 
 * @param {*} name 
 */
function currentTrend(s,name){
	return s.period[name]-s.lookback[5][name];
}

module.exports = function container (get, set, clear) {
return {
  name: 'ichi',
  description: 'Ichimoku Kinko Hyo, require a markup > 0 to follow trend. TODO : Support short / Don\'t trade in range',

  getOptions: function () {
    this.option('period', 'period length', String, '1m')
    this.option('min_periods', 'min. number of history periods', Number, 100)
    this.option('trend_ema', 'number of periods for trend EMA', Number, 20)
    
    this.option('cci_periods', '', Number, 20)
    this.option('cci_constant', '', Number, 0.015)
    this.option('cci_overbought', '', Number, 100)
    this.option('cci_oversold', '', Number, -100)

    this.option('neutral_rate', 'avoid trades if abs(trend_ema) under this float (0 to disable, "auto" for a variable filter)', Number, 'auto')

    this.option('oversold_rsi_periods', 'number of periods for oversold RSI', Number, 14)
    this.option('oversold_rsi', 'buy when RSI reaches this value', Number, 25)
    this.option('overbought_rsi', 'sell when RSI reaches this value', Number, 70)

    this.option('enable_short', 'Enable shorting (cost higher fee but allow to earn money down trade)', Boolean, true)
  },

    /*TODO : WTF ???
    */
  calculate: function (s) {
    //some additionnal indicator useful one day ;)
    get('lib.ema')(s, 'trend_ema', s.options.trend_ema)
    get('lib.cci')(s, 'cci', s.options.cci_periods,s.options.cci_constant)
    get('lib.rsi')(s, 'rsi', s.options.oversold_rsi_periods)
    //Ichimoku
    get('lib.midprice')(s, 'ts', 9)
    get('lib.midprice')(s, 'ks', 26)
    get('lib.midprice')(s, 'ssa', 1,'ks','ts')
    get('lib.midprice')(s, 'ssb', 52)
    
    //Calculate rate of ema's (useless but keeping it ;)
    if (s.period.trend_ema && s.lookback[0] && s.lookback[0].trend_ema) {
      s.period.trend_ema_rate = (s.period.trend_ema - s.lookback[0].trend_ema) / s.lookback[0].trend_ema * 100
    }
    if (s.options.neutral_rate === 'auto') {
      get('lib.stddev')(s, 'trend_ema_stddev', 10, 'trend_ema_rate')
    }
    else {
      s.period.trend_ema_stddev = s.options.neutral_rate
    }
  },

  onPeriod: function (s, cb) {
    if (typeof s.period.trend_ema_stddev === 'number') {
    //Normal BUY/SELL
      if (/* SELL */
        s.period.close < s.period.ts
        &&!s.shorting
      ){
        s.signal = 'sell';
      }else if(/* BUY */
        s.period.ts >= s.period.ks
        && s.period.close >= s.period.ks
        && s.lookback.length>25/**/ && s.period.ts >= s.lookback[25].ssa && s.period.ts >= s.lookback[25].ssb &&/**/s.period.ks >= s.lookback[25].ssa && s.period.ks >= s.lookback[25].ssb 
        //&& !isReversable(s)
        && s.lookback.length>25 && s.period.close >= s.lookback[25].close // Chikou must be above the actual price
        && currentTrend(s,'ssa')>=0
      ){
        s.signal = 'buy';      
      }
    //Short OPEN/CLOSE
      if(
      //When close < ts < ks < (ssa & ssb) we should short
        s.options.enable_short
        && (s.shorting === undefined || s.shorting === false)
        && (s.period.ts < s.period.ks && s.period.close < s.period.ts)
        && s.lookback.length>25 && s.period.ts <= s.lookback[25].ssa && s.period.ts <= s.lookback[25].ssb 
        && s.period.close<s.period.open // avoid short on flash crash recover
        && currentTrend(s,'ssb')<0//Only buy on big drop to avoid loosing money
      ){
        s.shorting = true;
	      s.signal = 'short';
      }else if(s.shorting === true && s.period.close >= s.period.ts){
	      s.shorting = false;
	      s.signal = 'close';
      }
    }
    cb()
  },

  onReport: function (s) {
    var cols = []
    if (typeof s.period.trend_ema_stddev === 'number') {
      var color = 'grey'
      if (s.period.trend_ema_rate > s.period.trend_ema_stddev) {
        color = 'green'
      }
      else if (s.period.trend_ema_rate < (s.period.trend_ema_stddev * -1)) {
        color = 'red'
      }
      cols.push(z(8, n(s.period.trend_ema_rate).format('0.0000'), ' ')[color])
      if (s.period.trend_ema_stddev) {
        cols.push(z(8, n(s.period.trend_ema_stddev).format('0.0000'), ' ').grey)
      }
      cols.push(z(10,n(s.period.cci).format('000'),' ').cyan)
      cols.push(z(10,n(s.period.ts).format('000.0'),' ').cyan)
      cols.push(z(10,n(s.period.ks).format('000.0'),' ').cyan)
      if(s.lookback.length>26){
        cols.push(z(10,n(s.lookback[25].ssa).format('000.0'),' ').red)
        cols.push(z(10,n(s.lookback[25].ssb).format('000.0'),' ').red)
      }
    }
    else {
      if (s.period.trend_ema_stddev) {
        cols.push('                  ')
      }
      else {
        cols.push('         ')
      }
    }
    return cols
  }
}
}
