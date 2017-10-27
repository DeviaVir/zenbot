var c = module.exports = {}

c.selector = 'gdax.ETH-EUR'
c.strategy = 'trend_ema'
c.currency_capital = 200
c.overbought_rsi_periods = 14
c.buy_pct = 100
c.sell_pct = 100
c.period = '30m'
c.order_type = 'maker'
c.stats = true
// c.mode = 'paper'

c.gdax = {} 
c.gdax.key = '6a3f18714aea94776ec963ab3b25ec6f'
c.gdax.b64secret = 'ZqckIAn8N+FYn0FgdCMauK1Sqo0z0wtRi/xZAvB7ASMpOEb14YOWYzTjbxrM6Spx5ue1GJHnFCZ0cCwiJGdiXg=='
c.gdax.passphrase = 'm2asoyjuazi'