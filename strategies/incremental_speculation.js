module.exports = {
  options: {
    period: "1h",
    fee_pct: 0.25,
    trend_ema: 36,
    price_ema: 6,
    start_capital: 1000,
    rsi_periods: 14,
    markup_pct: 0.01,
    markdown_pct: 0.01,
    bid_adjust_time: 300000,
    max_sell_loss_pct: -10
  }
}