import { ITrade, IQuote, IProduct } from '@types'

interface BaseOpts {
  asset: string
  currency: string
}

interface ProductOpts {
  product_id: string
}

type FeeOpts = BaseOpts
type BalanceOpts = BaseOpts

type TradesOpts = {
  to: string
  from: string
} & BaseOpts &
  ProductOpts

type TradeOpts = {
  price: number
  size: number
  post_only: boolean
  cancel_after?: string
  order_type?: string
} & ProductOpts

type OrderOpts = {
  order_id: string
}

type CancelOpts = OrderOpts

interface IExchange {
  name: string
  historyScan: string
  makerFee: number
  takerFee: number
  backfillRateLimit: number
  dynamicFees: boolean
  makerBuy100Workaround: boolean

  getProducts: () => any
  getTrades: (opts: TradesOpts, cb: any) => void
  getQuote: (opts: ProductOpts, cb: any) => void
  buy: (opts: TradeOpts, cb: any) => void
  sell: (opts: TradeOpts, cb: any) => void
  getCursor: (trade: any) => any
  setFees: (opts: FeeOpts) => void
  getBalance: (opts: BalanceOpts, cb: any) => void
  cancelOrder: (opts: CancelOpts, cb: any) => void
  getOrder: (opts: OrderOpts, cb: any) => void
}

export class Exchange {
  constructor(private exchange: IExchange) {}

  get name() {
    return this.exchange.name.toUpperCase()
  }

  get dynamicFees() {
    return this.exchange.dynamicFees
  }

  get historyScan() {
    return this.exchange.historyScan
  }

  get makerFee() {
    return this.exchange.makerFee
  }

  get takerFee() {
    return this.exchange.takerFee
  }

  get backfillRateLimit() {
    return this.exchange.backfillRateLimit
  }

  get makerBuy100Workaround() {
    return this.exchange.makerBuy100Workaround
  }

  setFees(opts: FeeOpts) {
    this.exchange.setFees(opts)
  }

  getProducts(): IProduct[] {
    return this.exchange.getProducts()
  }

  getCursor(trade) {
    this.exchange.getCursor(trade)
  }

  async getTrades(opts: TradesOpts) {
    return new Promise<ITrade[]>((resolve, reject) => {
      this.exchange.getTrades(opts, (err, trades) => (err ? reject(err) : resolve(trades)))
    })
  }

  async getQuote(opts: ProductOpts) {
    return new Promise<IQuote>((resolve, reject) => {
      this.exchange.getQuote(opts, (err, quote) => (err ? reject(err) : resolve(quote)))
    })
  }

  async buy(opts: TradeOpts) {
    return new Promise<Record<string, any>>((resolve, reject) => {
      this.exchange.buy(opts, (err, apiOrder) => (err ? reject(err) : resolve(apiOrder)))
    })
  }

  async sell(opts: TradeOpts) {
    return new Promise<Record<string, any>>((resolve, reject) => {
      this.exchange.sell(opts, (err, apiOrder) => (err ? reject(err) : resolve(apiOrder)))
    })
  }

  async getBalance(opts: BalanceOpts) {
    return new Promise<{ asset: number }>((resolve, reject) =>
      this.exchange.getBalance(opts, (err, balance) => (err ? reject(err) : resolve(balance)))
    )
  }

  async cancelOrder(opts: OrderOpts) {
    await new Promise((resolve) => this.exchange.cancelOrder(opts, () => resolve()))

    return await this.getOrder(opts)
  }

  async getOrder(opts: OrderOpts) {
    return new Promise<Record<string, any>>((resolve, reject) =>
      this.exchange.getOrder(opts, (err, apiOrder) => (err ? reject(err) : resolve(apiOrder)))
    )
  }

  async placeOrder(type: 'buy' | 'sell', opts: TradeOpts) {
    return type === 'buy' ? this.buy(opts) : this.sell(opts)
  }
}
