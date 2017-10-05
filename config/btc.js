var c = module.exports = {}

c.selector = 'gdax.BTC-EUR'
c.currency_capital = 1000
c.overbought_rsi_periods = 14
c.buy_pct = 99

// // MACD
// c.strategy = 'macd'
// c.period = '120m'
// results:
// end balance: 6798.44615800 (579.84%)
// buy hold: 6567.69115852 (556.77%)
// vs. buy hold: 3.51%
// 241 trades over 366 days (avg 0.66 trades/day)
// win/loss: 66/55
// error rate: 45.45%

// c.strategy = 'macd'
// c.period = '60m'
// results:
// end balance: 1705.77450269 (70.58%)
// buy hold: 1584.18125085 (58.42%)
// vs. buy hold: 7.68%
// 141 trades over 91 days (avg 1.55 trades/day)
// win/loss: 29/42
// error rate: 59.15%

// // Para SAR
// c.strategy = 'sar'
// c.period = '2m'

// // Stochastic MACD Strategy
// c.strategy = 'srsi_macd'

// TREND EMA
// c.strategy = 'trend_ema'
// c.period = '1h'
// results:
// end balance: 6456.47657664 (545.65%)
// buy hold: 6566.87132212 (556.69%)
// vs. buy hold: -1.68%
// 320 trades over 366 days (avg 0.87 trades/day)
// win/loss: 67/92
// error rate: 57.86%

c.strategy = 'trend_ema'
c.period = '30m'
// results:
// end balance: 4805.63637161 (380.56%)
// buy hold: 6565.15877498 (556.52%)
// vs. buy hold: -26.80%
// 751 trades over 366 days (avg 2.05 trades/day)
// win/loss: 129/245
// error rate: 65.51%