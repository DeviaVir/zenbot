var RSI = require('../../lib/rsi')

describe('RSI (Relative Strength Index)', function () {

  it('should calculate RSI with default period', function () {
    RSI(normalData, 'rsi', 14)

    expect(normalData.period.rsi).toEqual(32.26)
  })

  it('should set RSI to 100 when there is no losses for the entire period', function() {
    RSI(noLossData, 'rsi', 14)

    expect(noLossData.period.rsi).toEqual(100)
  })

  it('should set RSI to 0 when there is no gains for the entire period', function() {
    RSI(noGainData, 'rsi', 14)

    expect(noGainData.period.rsi).toEqual(0)
  })

  it('should set RSI to 0 when there is no price change for the entire period', function() {
    RSI(noPriceChangeData, 'rsi', 14)

    expect(noPriceChangeData.period.rsi).toEqual(100)
  })
})


var normalData = {
  lookback: [
    {close: 46.28},
    {close: 46.00},
    {close: 46.03},
    {close: 46.41},
    {close: 46.22},
    {close: 45.64},
    {close: 46.21},
    {close: 46.25},
    {close: 45.71},
    {close: 46.45},
    {close: 45.78},
    {close: 45.35},
    {close: 44.03},
    {close: 44.18},
    {close: 44.22},
    {close: 44.57},
    {close: 43.42},
    {close: 42.66},
    {close: 43.13}
  ],
  period: {}
}

var noLossData = {
  lookback: [
    {close: 46.08},
    {close: 46.18},
    {close: 46.28},
    {close: 46.38},
    {close: 46.48},
    {close: 46.58},
    {close: 46.68},
    {close: 46.78},
    {close: 46.88},
    {close: 46.98},
    {close: 47.08},
    {close: 47.18},
    {close: 47.28},
    {close: 47.38},
    {close: 47.48},
    {close: 47.58},
    {close: 47.68},
    {close: 47.78},
    {close: 47.88}
  ],
  period: {}
}

var noGainData = {
  lookback: noLossData.lookback.slice(0).reverse(),
  period: {}
}

var noPriceChangeData = {
  lookback: [
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8},
    {close: 46.8}
  ],
  period: {}
}

