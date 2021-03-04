### The `sar` strategy

Uses a [Parabolic SAR](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:parabolic_sar) indicator to trade when SAR trend reverses.

- Tends to generate earlier signals than EMA-based strategies, resulting in better capture of highs and lows, and better protection against quick price drops.
- Does not perform well in sideways (non-trending) markets, generating more whipsaws than EMA-based strategies.
- Most effective with short period (default is 2m), which means it generates 50-100 trades/day, so only usable on GDAX (with 0% maker fee) at the moment.
- Tested live, [results here](https://github.com/carlos8f/zenbot/pull/246#issuecomment-307528347)
