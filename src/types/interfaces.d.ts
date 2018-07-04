interface State {
  options: Options
  exchange: Exchange
  product_id: string
  asset: string
  currency: string
  asset_capital: number
  product: Product
  balance: Balance
  ctx: Ctx
  lookback: Lookback[]
  day_count: number
  my_trades: Trade[]
  my_prev_trades: Trade[]
  vol_since_last_blink: number
  boot_time: number
  tz_offset: number
  last_trade_id: number
  trades: Trade[]
  strategy: Strategy
  last_day: number
  period: Period
  marketData: MarketData
  acted_on_stop: boolean
  action?: string
  signal?: string
  port: number
  url: string
  quote: Quote
  start_price: number
  start_capital: number
  real_capital: number
  net_currency: number
  orig_capital: number
  orig_price: number
  stats: Stats
}

interface Stats {
  profit: string
  tmp_balance: string
  buy_hold: string
  buy_hold_profit: string
  day_count: number
  trade_per_day: string
}

interface Quote {
  bid: string
  ask: string
}

interface MarketData {
  open: number[]
  close: number[]
  high: number[]
  low: number[]
  volume: number[]
}

interface Period {
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

interface Strategy {
  name: string
  description: string
  phenotypes: Phenotypes
}

interface Phenotypes {
  period_length: Periodlength
  min_periods: Minperiods
  markdown_buy_pct: Minperiods
  markup_sell_pct: Minperiods
  order_type: Ordertype
  sell_stop_pct: Minperiods
  buy_stop_pct: Minperiods
  profit_stop_enable_pct: Minperiods
  profit_stop_pct: Minperiods
  ema_short_period: Minperiods
  ema_long_period: Minperiods
  signal_period: Minperiods
  up_trend_threshold: Minperiods
  down_trend_threshold: Minperiods
  overbought_rsi_periods: Minperiods
  overbought_rsi: Minperiods
}

interface Ordertype {
  type: string
  options: string[]
}

interface Minperiods {
  type: string
  min: number
  max: number
}

interface Periodlength {
  type: string
  min: number
  max: number
  period_length: string
}

interface Trade {
  _id: string
  trade_id: number
  time: number
  size: number
  price: number
  side: string
  id: string
  selector: string
}

interface Lookback {
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

interface Ctx {}

interface Balance {
  asset: string
  currency: string
  currency_hold: string
  asset_hold: string
  deposit: number
}

interface Product {
  asset: string
  currency: string
  min_size: string
  max_size: string
  increment: string
  label: string
}

interface Exchange {
  name: string
  historyScan: string
  makerFee: number
  takerFee: number
  backfillRateLimit: number
}

interface Options {
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
  selector: Selector
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

interface Selector {
  exchange_id: string
  product_id: string
  asset: string
  currency: string
  normalized: string
}
