### The `trend_ema` strategy

- The default strategy is called `trend_ema` and resides at `./extensions/strategies/trend_ema`.
- Defaults to using a 2m period, but you can override this with adding e.g. `--period=5m` to the `sim` or `trade` commands.
- Computes the 26-period EMA of the current price, and calculates the percent change from the last period's EMA to get the `trend_ema_rate`
- Considers `trend_ema_rate >= 0` an upwards trend and `trend_ema_rate < 0` a downwards trend
- Filters out low values (whipsaws) by `neutral_rate`, which when set to `auto`, uses the standard deviation of the `trend_ema_rate` as a variable noise filter.
- Buys at the beginning of upwards trend, sells at the beginning of downwards trend
- If `oversold_rsi` is set, tries to buy when the RSI dips below that value, and then starts to recover (a counterpart to `--profit_stop_enable_pct`, which sells when a percent of profit is reached, and then dips)
- The bot will always try to avoid trade fees, by using post-only orders and thus being a market "maker" instead of a "taker". Some exchanges will, however, not offer maker discounts.
