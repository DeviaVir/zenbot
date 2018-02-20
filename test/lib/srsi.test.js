var SRSI = require('../../lib/srsi')

describe('SRSI (StochRSI Oscillator)', function () {

  it('should calculate SRSI with default period', function () {
    SRSI(data, 'srsi', 14, 3, 3)

    expect(data.period.srsi_K).toEqual(19.38)
    expect(data.period.srsi_D).toEqual(23.18)
  })
})

var data = {
  lookback: [
    {rsi:  64.38},
    {rsi:  66.71},
    {rsi:  70.29},
    {rsi:  66.49},
    {rsi:  71.47},
    {rsi:  76.17},
    {rsi:  83.66},
    {rsi:  81.85},
    {rsi:  82.55},
    {rsi:  82.89},
    {rsi:  78.60},
    {rsi:  64.78},
    {rsi:  64.77},
    {rsi:  70.05},
    {rsi:  68.76},
    {rsi:  69.53},
    {rsi:  70.15}
  ].reverse(),
  period: {
    rsi:  65.61
  }
}
