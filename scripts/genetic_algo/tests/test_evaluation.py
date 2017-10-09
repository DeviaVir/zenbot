from evaluation import fuzz_product
from parsing import args_for_strategy
from unittest.mock import patch


def test_parse_strategies():
    asd = b'''
macd
  description:
    Buy when (MACD - Signal > 0) and sell when (MACD - Signal < 0).
  options:
    --period=<value>  period length (default: 1h)
    --min_periods=<value>  min. number of history periods (default: 52)
    --ema_short_period=<value>  number of periods for the shorter EMA (default: 12)
    --ema_long_period=<value>  number of periods for the longer EMA (default: 26)
    --signal_period=<value>  number of periods for the signal EMA (default: 9)
    --up_trend_threshold=<value>  threshold to trigger a buy signal (default: 0)
    --down_trend_threshold=<value>  threshold to trigger a sold signal (default: 0)
    --overbought_rsi_periods=<value>  number of periods for overbought RSI (default: 25)
    --overbought_rsi=<value>  sold when RSI exceeds this value (default: 70)
sar
  description:
    Parabolic SAR
  options:
    --period=<value>  period length (default: 2m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --sar_af=<value>  acceleration factor for parabolic SAR (default: 0.015)
    --sar_max_af=<value>  max acceleration factor for parabolic SAR (default: 0.3)
trend_ema (default)
  description:
    Buy when (EMA - last(EMA) > 0) and sell when (EMA - last(EMA) < 0). Optional buy on low RSI.
  options:
    --period=<value>  period length (default: 10m)
    --min_periods=<value>  min. number of history periods (default: 52)
    --trend_ema=<value>  number of periods for trend EMA (default: 20)
    --neutral_rate=<value>  avoid trades if abs(trend_ema) under this float (0 to disable, "auto" for a variable filter) (default: 0.06)
    --oversold_rsi_periods=<value>  number of periods for oversold RSI (default: 20)
    --oversold_rsi=<value>  buy when RSI reaches this value (default: 30)
    '''


    with patch('evaluation.subprocess.check_output', lambda *x, **y: asd):
        assert args_for_strategy('sar') == ['period', 'min_periods', 'sar_af', 'sar_max_af']
