import bollinger from './bollinger'
import cci_srsi from './cci_srsi'
import crossover_vwap from './crossover_vwap'
import dema from './dema'
import ehlers_ft from './ehlers_ft'
import ehlers_mama from './ehlers_mama'
import ehlers_trend from './ehlers_trend'
import forex_analytics from './forex_analytics'
import ichimoku from './ichimoku'
import ichimoku_Score from './ichimoku_Score'
import kc from './kc'
import macd from './macd'
import momentum from './momentum'
import neural from './neural'
import noop from './noop'
import rsi from './rsi'
import sar from './sar'
import speed from './speed'
import srsi_macd from './srsi_macd'
import stddev from './stddev'
import ta_ema from './ta_ema'
import ta_macd from './ta_macd'
import ta_macd_ext from './ta_macd_ext'
import ta_ppo from './ta_ppo'
import ta_srsi_bollinger from './ta_srsi_bollinger'
import ta_stoch_bollinger from './ta_stoch_bollinger'
import ta_trix from './ta_trix'
import ta_ultosc from './ta_ultosc'
import ti_bollinger from './ti_bollinger'
import ti_hma from './ti_hma'
import ti_stoch from './ti_stoch'
import ti_stoch_bollinger from './ti_stoch_bollinger'
import trend_bollinger from './trend_bollinger'
import trend_ema from './trend_ema'
import trendline from './trendline'
import trust_distrust from './trust_distrust'
import wavetrend from './wavetrend'

const strategies = {
  bollinger,
  cci_srsi,
  crossover_vwap,
  dema,
  ehlers_ft,
  ehlers_mama,
  ehlers_trend,
  forex_analytics,
  ichimoku,
  ichimoku_Score,
  kc,
  macd,
  momentum,
  neural,
  noop,
  rsi,
  sar,
  speed,
  srsi_macd,
  stddev,
  ta_ema,
  ta_macd,
  ta_macd_ext,
  ta_ppo,
  ta_srsi_bollinger,
  ta_stoch_bollinger,
  ta_trix,
  ta_ultosc,
  ti_bollinger,
  ti_hma,
  ti_stoch,
  ti_stoch_bollinger,
  trend_bollinger,
  trend_ema,
  trendline,
  trust_distrust,
  wavetrend,
}

export const loadStrategy = (strategy: string) => {
  return strategies[strategy]
}
