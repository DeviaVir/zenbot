import { Db } from 'mongodb'

export interface IZenbotConfig {
  version: string
  conf: {
    eventBus: NodeJS.EventEmitter
    db: {
      mongo: Db
    }
    srcRoot: string
    [key: string]: any
  }
}

export interface IZenbotRuntime {
  options: IOptions
  exchange: IExchange
  product_id: string
  asset: string
  currency: string
  asset_capital: number
  product: IProduct
  balance: IBalance
  ctx: ICtx
  lookback: ILookback[]
  day_count: number
  my_trades: ITrade[]
  my_prev_trades: ITrade[]
  vol_since_last_blink: number
  boot_time: number
  tz_offset: number
  last_trade_id: number
  trades: ITrade[]
  strategy: IStrategy
  last_day: number
  period: IPeriod
  marketData: IMarketData
  acted_on_stop: boolean
  action?: string
  signal?: string
  port: number
  url: string
  quote: IQuote
  start_price: number
  start_capital: number
  real_capital: number
  net_currency: number
  orig_capital: number
  orig_price: number
  stats: IStats
}

export interface IStats {
  profit: string
  tmp_balance: string
  buy_hold: string
  buy_hold_profit: string
  day_count: number
  trade_per_day: string
}

export interface IQuote {
  bid: string
  ask: string
}

export interface IMarketData {
  open: number[]
  close: number[]
  high: number[]
  low: number[]
  volume: number[]
}

export interface IPeriod {
  period_id: string
  size: string
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  close_time: number
  latest_trade_time: number
  overbought_rsi_avg_gain: number
  overbought_rsi_avg_loss: number
  overbought_rsi: number
  rsi_avg_gain: number
  rsi_avg_loss: number
  rsi: number
}

export interface IStrategy {
  name: string
  description: string
  phenotypes: IPhenotypes
}

export interface IPhenotypes {
  period_length: IPeriodlength
  min_periods: IMinperiods
  markdown_buy_pct: IMinperiods
  markup_sell_pct: IMinperiods
  order_type: IOrdertype
  sell_stop_pct: IMinperiods
  buy_stop_pct: IMinperiods
  profit_stop_enable_pct: IMinperiods
  profit_stop_pct: IMinperiods
  ema_short_period: IMinperiods
  ema_long_period: IMinperiods
  signal_period: IMinperiods
  up_trend_threshold: IMinperiods
  down_trend_threshold: IMinperiods
  overbought_rsi_periods: IMinperiods
  overbought_rsi: IMinperiods
}

export interface IOrdertype {
  type: string
  options: string[]
}

export interface IMinperiods {
  type: string
  min: number
  max: number
}

export interface IPeriodlength {
  type: string
  min: number
  max: number
  period_length: string
}

export interface ITrade {
  _id: string
  trade_id: number
  time: number
  size: number
  price: number
  side: string
  id: string
  selector: string
}

export interface ILookback {
  period_id: string
  size: string
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  close_time: number
  latest_trade_time: number
  overbought_rsi_avg_gain: number
  overbought_rsi_avg_loss: number
  overbought_rsi: number
  id: string
  selector: string
  session_id: string
  _id: string
  macd: number
  macd_histogram: number
  macd_signal: number
  rsi_avg_gain: number
  rsi_avg_loss: number
  rsi: number
}

export interface ICtx {}

export interface IBalance {
  asset: string
  currency: string
  currency_hold: string
  asset_hold: string
  deposit: number
}

export interface IProduct {
  asset: string
  currency: string
  min_size: string
  max_size: string
  increment: string
  label: string
}

export interface IExchange {
  name: string
  historyScan: string
  makerFee: number
  takerFee: number
  backfillRateLimit: number
}

export interface IOptions {
  period: string
  strategy: string
  sell_stop_pct: number
  buy_stop_pct: number
  profit_stop_enable_pct: number
  profit_stop_pct: number
  max_slippage_pct: number
  buy_pct: number
  sell_pct: number
  order_adjust_time: number
  max_sell_loss_pct: number
  order_poll_time: number
  markdown_buy_pct: number
  markup_sell_pct: number
  order_type: string
  poll_trades: number
  currency_capital: number
  asset_capital: number
  rsi_periods: number
  avg_slippage_pct: number
  max_buy_loss_pct: number
  keep_lookback_periods: number
  min_prev_trades: number
  currency_increment?: any
  use_prev_trades: boolean
  stats: boolean
  mode: string
  selector: ISelector
  period_length: string
  min_periods: number
  ema_short_period: number
  ema_long_period: number
  signal_period: number
  up_trend_threshold: number
  down_trend_threshold: number
  overbought_rsi_periods: number
  overbought_rsi: number
}

export interface ISelector {
  exchange_id: string
  product_id: string
  asset: string
  currency: string
  normalized: string
}
