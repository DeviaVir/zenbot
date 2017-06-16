module.exports = {
  _ns: 'zenbot'

  ,'talib.ema': require('./ema')
  ,'talib.obv': require('./obv')
  ,'talib.obvs': require('./obvs')
  ,'talib.ad': require('./ad')
  ,'talib.ads': require('./ads')


  // To be reviewed
  ,'talib.macd': require('./macd')
  //,'talib.list[2]': '#talib.macd'
  ,'talib.rsi': require('./rsi')
  //,'talib.list[5]': '#talib.rsi'
  ,'talib.adx': require('./adx')
  //,'talib.list[7]': '#talib.adx'
  //TODO: add OBV, ARONOSC
}
