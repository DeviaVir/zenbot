def pct(x):
    return x / 100.0


def minutes(x):
    return str(int(x)) + 'm'


args = {
    'period': minutes,
    'trend_ema': int,
    'neutral_rate': pct,
    'oversold_rsi_periods': int,
    'oversold_rsi': float,
    'sell_stop_pct': float,
    'rsi_periods':int,
    'max_sell_loss_pct':float,
    'profit_stop_enable_pct':float,
    'profit_stop_pct':float,
    'sell_rate':pct,
}