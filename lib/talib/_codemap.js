module.exports = {
  _ns: 'zenbot'

  ,'talib.ema': require('./ema')
  ,'talib.obv': require('./obv')
  ,'talib.obv_slope': require('./obv_slope')


  // To be reviewed
  //,'talib.list[0]': '#talib.ema'
  ,'talib.dema': require('./dema')
  //,'talib.list[1]': '#talib.dema'
  ,'talib.macd': require('./macd')
  //,'talib.list[2]': '#talib.macd'
  ,'talib.typ_price': require('./typ_price')
  //,'talib.list[3]': '#talib.typ_price'
  ,'talib.cci': require('./cci')
  //,'talib.list[4]': '#talib.cci'
  ,'talib.rsi': require('./rsi')
  //,'talib.list[5]': '#talib.rsi'
  ,'talib.stoch_osc': require('./stoch_osc')
  //,'talib.list[6]': '#talib.stoch_osc'
  ,'talib.adx': require('./adx')
  //,'talib.list[7]': '#talib.adx'
  //TODO: add OBV, ARONOSC
}
