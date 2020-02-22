
```
zenbot list-strategies

bollinger
  description:
    Buy when (Signal ≤ Lower Bollinger Band) and sell when (Signal ≥ Upper Bollinger Band).
  options:
    --period=<value>  period length, same as --period_length (default: 1h)
    --period_length=<value>  period length, same as --period (default: 1h)
    --min_periods=<value>  min. number of history periods (default: 52)
    --bollinger_size=<value>  period size (default: 20)
    --bollinger_time=<value>  times of standard deviation between the upper band and the moving averages (default: 2)
    --bollinger_upper_bound_pct=<value>  pct the current price should be near the bollinger upper bound before we sell (default: 0)
    --bollinger_lower_bound_pct=<value>  pct the current price should be near the bollinger lower bound before we buy (default: 0)

cci_srsi
  description:
    Stochastic CCI Strategy
  options:
    --period=<value>  period length, same as --period_length (default: 20m)
    --period_length=<value>  period length, same as --period (default: 20m)
    --min_periods=<value>  min. number of history periods (default: 30)
    --ema_acc=<value>  sideways threshold (0.2-0.4) (default: 0.03)
    --cci_periods=<value>  number of RSI periods (default: 14)
    --rsi_periods=<value>  number of RSI periods (default: 14)
    --srsi_periods=<value>  number of RSI periods (default: 9)
    --srsi_k=<value>  %K line (default: 5)
    --srsi_d=<value>  %D line (default: 3)
    --oversold_rsi=<value>  buy when RSI reaches or drops below this value (default: 18)
    --overbought_rsi=<value>  sell when RSI reaches or goes above this value (default: 85)
    --oversold_cci=<value>  buy when CCI reaches or drops below this value (default: -90)
    --overbought_cci=<value>  sell when CCI reaches or goes above this value (default: 140)
    --constant=<value>  constant (default: 0.015)
If you have questions about this strategy, contact me... @talvasconcelos

crossover_vwap
  description:
    Estimate trends by comparing "Volume Weighted Average Price" to the "Exponential Moving Average".
  options:
    --period=<value>  period length, same as --period_length (default: 120m)
    --period_length=<value>  period length, same as --period (default: 120m)
    --emalen1=<value>  Length of EMA 1 (default: 30)
    --smalen1=<value>  Length of SMA 1 (default: 108)
    --smalen2=<value>  Length of SMA 2 (default: 60)
    --vwap_length=<value>  Min periods for vwap to start (default: 10)
    --vwap_max=<value>  Max history for vwap. Increasing this makes it more sensitive to short-term changes (default: 8000)

dema
  description:
    Buy when (short ema > long ema) and sell when (short ema < long ema).
  options:
    --period=<value>  period length (default: 1h)
    --min_periods=<value>  min. number of history periods (default: 21)
    --ema_short_period=<value>  number of periods for the shorter EMA (default: 10)
    --ema_long_period=<value>  number of periods for the longer EMA (default: 21)
    --up_trend_threshold=<value>  threshold to trigger a buy signal (default: 0)
    --down_trend_threshold=<value>  threshold to trigger a sold signal (default: 0)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 9)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 80)
    --noise_level_pct=<value>  do not trade when short ema is with this % of last short ema, 0 disables this feature (default: 0)

macd
  description:
    Buy when (MACD - Signal > 0) and sell when (MACD - Signal < 0).
  options:
    --period=<value>  period length, same as --period_length (default: 1h)
    --period_length=<value>  period length, same as --period (default: 1h)
    --min_periods=<value>  min. number of history periods (default: 52)
    --ema_short_period=<value>  number of periods for the shorter EMA (default: 12)
    --ema_long_period=<value>  number of periods for the longer EMA (default: 26)
    --signal_period=<value>  number of periods for the signal EMA (default: 9)
    --up_trend_threshold=<value>  threshold to trigger a buy signal (default: 0)
    --down_trend_threshold=<value>  threshold to trigger a sold signal (default: 0)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 25)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 70)

momentum
  description:
    MOM = Close(Period) - Close(Length)
  options:
    --momentum_size=<value>  number of periods to look back for momentum (default: 5)

neural
  description:
    Use neural learning to predict future price. Buy = mean(last 3 real prices) < mean(current & last prediction)
  options:
    --period=<value>  period length - make sure to lower your poll trades time to lower than this value. Same as --period_length (default: 1m)
    --period_length=<value>  period length - make sure to lower your poll trades time to lower than this value. Same as --period (default: 1m)
    --activation_1_type=<value>  Neuron Activation Type: sigmoid, tanh, relu (default: sigmoid)
    --neurons_1=<value>  Neurons in layer 1 Shoot for atleast 100 (default: 1)
    --depth=<value>  Rows of data to predict ahead for matches/learning (default: 1)
    --selector=<value>  Selector (default: Gdax.BTC-USD)
    --min_periods=<value>  Periods to calculate learn from (default: 1000)
    --min_predict=<value>  Periods to predict next number from (default: 1)
    --momentum=<value>  momentum of prediction (default: 0.9)
    --decay=<value>  decay of prediction, use teeny tiny increments (default: 0.1)
    --threads=<value>  Number of processing threads you'd like to run (best for sim) (default: 1)
    --learns=<value>  Number of times to 'learn' the neural network with past data (default: 2)

noop
  description:
    Just do nothing. Can be used to e.g. for training the strategy.
  options:
    --period=<value>  period length, same as --period_length (default: 30m)
    --period_length=<value>  period length, same as --period (default: 30m)

rsi
  description:
    Attempts to buy low and sell high by tracking RSI high-water readings.
  options:
    --period=<value>  period length, same as --period_length (default: 2m)
    --period_length=<value>  period length, same as --period (default: 2m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --rsi_periods=<value>  number of RSI periods
    --oversold_rsi=<value>  buy when RSI reaches or drops below this value (default: 30)
    --overbought_rsi=<value>  sell when RSI reaches or goes above this value (default: 82)
    --rsi_recover=<value>  allow RSI to recover this many points before buying (default: 3)
    --rsi_drop=<value>  allow RSI to fall this many points before selling (default: 0)
    --rsi_divisor=<value>  sell when RSI reaches high-water reading divided by this value (default: 2)

sar
  description:
    Parabolic SAR
  options:
    --period=<value>  period length, same as --period_length (default: 2m)
    --period_length=<value>  period length, same as --period (default: 2m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --sar_af=<value>  acceleration factor for parabolic SAR (default: 0.015)
    --sar_max_af=<value>  max acceleration factor for parabolic SAR (default: 0.3)

speed
  description:
    Trade when % change from last two 1m periods is higher than average.
  options:
    --period=<value>  period length, same as --period_length (default: 1m)
    --period_length=<value>  period length, same as --period (default: 1m)
    --min_periods=<value>  min. number of history periods (default: 3000)
    --baseline_periods=<value>  lookback periods for volatility baseline (default: 3000)
    --trigger_factor=<value>  multiply with volatility baseline EMA to get trigger value (default: 1.6)

srsi_macd
  description:
    Stochastic MACD Strategy
  options:
    --period=<value>  period length, same as --period_length (default: 30m)
    --period_length=<value>  period length, same as --period (default: 30m)
    --min_periods=<value>  min. number of history periods (default: 200)
    --rsi_periods=<value>  number of RSI periods
    --srsi_periods=<value>  number of RSI periods (default: 9)
    --srsi_k=<value>  %D line (default: 5)
    --srsi_d=<value>  %D line (default: 3)
    --oversold_rsi=<value>  buy when RSI reaches or drops below this value (default: 20)
    --overbought_rsi=<value>  sell when RSI reaches or goes above this value (default: 80)
    --ema_short_period=<value>  number of periods for the shorter EMA (default: 24)
    --ema_long_period=<value>  number of periods for the longer EMA (default: 200)
    --signal_period=<value>  number of periods for the signal EMA (default: 9)
    --up_trend_threshold=<value>  threshold to trigger a buy signal (default: 0)
    --down_trend_threshold=<value>  threshold to trigger a sold signal (default: 0)

stddev
  description:
    Buy when standard deviation and mean increase, sell on mean decrease.
  options:
    --period=<value>  period length, set poll trades to 100ms, poll order 1000ms. Same as --period_length (default: 100ms)
    --period_length=<value>  period length, set poll trades to 100ms, poll order 1000ms. Same as --period (default: 100ms)
    --trendtrades_1=<value>  Trades for array 1 to be subtracted stddev and mean from (default: 5)
    --trendtrades_2=<value>  Trades for array 2 to be calculated stddev and mean from (default: 53)
    --min_periods=<value>  min_periods (default: 1250)

ta_ema
  description:
    Buy when (EMA - last(EMA) > 0) and sell when (EMA - last(EMA) < 0). Optional buy on low RSI.
  options:
    --period=<value>  period length, same as --period_length (default: 10m)
    --period_length=<value>  period length, same as --period (default: 10m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --trend_ema=<value>  number of periods for trend EMA (default: 20)
    --neutral_rate=<value>  avoid trades if abs(trend_ema) under this float (0 to disable, "auto" for a variable filter) (default: 0.06)
    --oversold_rsi_periods=<value>  number of periods for oversold RSI (default: 20)
    --oversold_rsi=<value>  buy when RSI reaches this value (default: 30)

ta_macd
  description:
    Buy when (MACD - Signal > 0) and sell when (MACD - Signal < 0).
  options:
    --period=<value>  period length, same as --period_length (default: 1h)
    --period_length=<value>  period length, same as --period (default: 1h)
    --min_periods=<value>  min. number of history periods (default: 52)
    --ema_short_period=<value>  number of periods for the shorter EMA (default: 12)
    --ema_long_period=<value>  number of periods for the longer EMA (default: 26)
    --signal_period=<value>  number of periods for the signal EMA (default: 9)
    --up_trend_threshold=<value>  threshold to trigger a buy signal (default: 0)
    --down_trend_threshold=<value>  threshold to trigger a sold signal (default: 0)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 25)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 70)

ta_macd_ext
  description:
    Buy when (MACD - Signal > 0) and sell when (MACD - Signal < 0) with controllable talib TA types
  options:
    --period=<value>  period length, same as --period_length (default: 1h)
    --min_periods=<value>  min. number of history periods (default: 52)
    --ema_short_period=<value>  number of periods for the shorter EMA (default: 12)
    --ema_long_period=<value>  number of periods for the longer EMA (default: 26)
    --signal_period=<value>  number of periods for the signal EMA (default: 9)
    --fast_ma_type=<value>  fast_ma_type of talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (default: null)
    --slow_ma_type=<value>  slow_ma_type of talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (default: null)
    --signal_ma_type=<value>  signal_ma_type of talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (default: null)
    --default_ma_type=<value>  set default ma_type for fast, slow and signal. You are able to overwrite single types separately (fast_ma_type, slow_ma_type, signal_ma_type) (default: SMA)
    --up_trend_threshold=<value>  threshold to trigger a buy signal (default: 0)
    --down_trend_threshold=<value>  threshold to trigger a sold signal (default: 0)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 25)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 70)

ta_trix
  description:
    TRIX - 1-day Rate-Of-Change (ROC) of a Triple Smooth EMA with rsi oversold
  options:
    --period=<value>  period length eg 10m (default: 5m)
    --timeperiod=<value>  timeperiod for TRIX (default: 30)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 25)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 70)

trend_ema (default)
  description:
    Buy when (EMA - last(EMA) > 0) and sell when (EMA - last(EMA) < 0). Optional buy on low RSI.
  options:
    --period=<value>  period length, same as --period_length (default: 2m)
    --period_length=<value>  period length, same as --period (default: 2m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --trend_ema=<value>  number of periods for trend EMA (default: 26)
    --neutral_rate=<value>  avoid trades if abs(trend_ema) under this float (0 to disable, "auto" for a variable filter) (default: auto)
    --oversold_rsi_periods=<value>  number of periods for oversold RSI (default: 14)
    --oversold_rsi=<value>  buy when RSI reaches this value (default: 10)

ta_ppo
  description:
     PPO - Percentage Price Oscillator with rsi oversold
  options:
    --period=<value>  period length, same as --period_length (default: 10m)
    --ema_short_period=<value>  number of periods for the shorter EMA (default: 12)
    --ema_long_period=<value>  number of periods for the longer EMA (default: 26)
    --signal_period=<value>  number of periods for the signal EMA (default: 9)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 25)
    --ma_type==<value> moving average type of talib: SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3 (default: SMA)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 70)

ta_ultosc
  description:
    ULTOSC - Ultimate Oscillator with rsi oversold
  options:
    --period=<value>  period length eg 5m (default: 5m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --signal=<value>  Provide signal and indicator "simple" (buy@65, sell@50), "low" (buy@65, sell@30), "trend" (buy@30, sell@70) (default: simple)
    --timeperiod1=<value>  talib ULTOSC timeperiod1 (default: 7)
    --timeperiod2=<value>  talib ULTOSC timeperiod2 (default: 14)
    --timeperiod3=<value>  talib ULTOSC timeperiod3 (default: 28)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 25)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 90)

ti_hma
  description:
    HMA - Hull Moving Average
  options:
    --period=<value>  period length eg 10m (default: 15m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --trend_hma=<value>  number of periods for trend hma (default: 36)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 25)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 70)

trendline
  description:
    Calculate a trendline and trade when trend is positive vs negative.
  options:
    --period=<value>  period length (default: 30s)
    --period_length=<value>  period length (default: 30s)
    --lastpoints=<value>  Number of trades for short trend average (default: 100)
    --avgpoints=<value>  Number of trades for long trend average (default: 1000)
    --lastpoints2=<value>  Number of trades for short trend average (default: 10)
    --avgpoints2=<value>  Number of trades for long trend average (default: 100)
    --min_periods=<value>  Basically avgpoints + a BUNCH of more preroll periods for anything less than 5s period (default: 15000)
    --markup_sell_pct=<value>  test (default: 0)
    --markdown_buy_pct=<value>  test (default: 0)

trust_distrust
  description:
    Sell when price higher than $sell_min% and highest point - $sell_threshold% is reached. Buy when lowest price point + $buy_threshold% reached.
  options:
    --period=<value>  period length, same as --period_length (default: 30m)
    --period_length=<value>  period length, same as --period (default: 30m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --sell_threshold=<value>  sell when the top drops at least below this percentage (default: 2)
    --sell_threshold_max=<value>  sell when the top drops lower than this max, regardless of sell_min (panic sell, 0 to disable) (default: 0)
    --sell_min=<value>  do not act on anything unless the price is this percentage above the original price (default: 1)
    --buy_threshold=<value>  buy when the bottom increased at least above this percentage (default: 2)
    --buy_threshold_max=<value>  wait for multiple buy signals before buying (kill whipsaw, 0 to disable) (default: 0)
    --greed=<value>  sell if we reach this much profit (0 to be greedy and either win or lose) (default: 0)

wavetrend
  description:
    Buy when (Signal < Oversold) and sell when (Signal > Overbought).
  options:
    --period=<value>  period length, same as --period_length (default: 1h)
    --period_length=<value>  period length, same as --period (default: 1h)
    --min_periods=<value>  min. number of history periods (default: 21)
    --wavetrend_channel_length=<value>  wavetrend channel length (default: 10)
    --wavetrend_average_length=<value>  wavetrend average length (default: 21)
    --wavetrend_overbought_1=<value>  wavetrend overbought limit 1 (default: 60)
    --wavetrend_overbought_2=<value>  wavetrend overbought limit 2 (default: 53)
    --wavetrend_oversold_1=<value>  wavetrend oversold limit 1 (default: -60)
    --wavetrend_oversold_2=<value>  wavetrend oversold limit 2 (default: -53)
    --wavetrend_trends=<value>  act on trends instead of limits (default: false)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 9)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 80)
```
