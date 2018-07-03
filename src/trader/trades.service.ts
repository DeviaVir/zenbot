import { Collection } from 'mongodb'

interface Exchange {
  getProducts: () => any
  getTrades: (opts, cb) => any
  getBalance: (opts, cb) => any
  getQuote: (opts, cb) => any
  cancelOrder: (opts, cb) => any
  buy: (opts, cb) => any
  sell: (opts, cb) => any
  getOrder: (opts, cb) => any
  getCursor: (trade) => any
}

interface TradesOptions {
  selector: string
  usePrevTrades: boolean
  minPrevTrades: number
  startTime: string
  sort?: { [key: string]: 1 | -1 }
  limit?: number
}

export class TradesService {
  public myTrades: any[] = []

  private dbCursor: string = null
  private tradeCursor: number = null
  private allTradesCollection: Collection = null
  private myTradesCollection: Collection = null

  constructor(private collectionServiceInstance: any, private exchange: Exchange, private opts: TradesOptions) {
    this.allTradesCollection = this.collectionServiceInstance.getTrades()
    this.myTradesCollection = this.collectionServiceInstance.getMyTrades()
  }

  async getNext() {
    const query = {
      selector: this.opts.selector,
      time: !this.dbCursor ? { $gte: this.opts.startTime } : { $gt: this.dbCursor },
    }

    const trades = await this.allTradesCollection
      .find(query)
      .sort(this.opts.sort)
      .limit(this.opts.limit)
      .toArray()

    if (!trades.length) return []

    if (this.opts.usePrevTrades) {
      await this.getMyTrades(trades[0].time)
    }

    const lastTrade = trades[trades.length - 1]
    this.dbCursor = lastTrade.time
    this.tradeCursor = this.exchange.getCursor(lastTrade)

    return trades
  }

  async getMyTrades(firststTradeTime: string) {
    const query: Record<string, any> = {
      selector: this.opts.selector,
    }

    if (!this.opts.minPrevTrades) {
      query.time = { $gte: firststTradeTime }
    }

    this.myTrades = await this.myTradesCollection
      .find(query)
      .sort({ $natural: -1 })
      .limit(this.opts.minPrevTrades)
      .toArray()
  }

  async getTrades() {
    const opts = {
      product_id: this.opts.selector,
      from: this.tradeCursor,
    }

    const trades = ((await new Promise((resolve, reject) =>
      this.exchange.getTrades(opts, (err, trades) => (err ? reject(err) : resolve(trades)))
    )) as any[]).sort(({ time: a }, { time: b }) => (a === b ? 0 : a > b ? -1 : 1))

    trades.forEach((trade) => {
      const tradeCursor = this.exchange.getCursor(trade)
      this.tradeCursor = Math.max(tradeCursor, this.tradeCursor)
      this.saveTrade(trade)
    })

    return trades
  }

  async saveTrade(trade: any) {
    const tradeData = {
      ...trade,
      selector: this.opts.selector,
      id: `selector-${trade.trade_id}`,
    }

    try {
      await this.allTradesCollection.save(tradeData)
    } catch (err) {
      console.error(err)
    }
  }

  getTradeCursor() {
    return this.tradeCursor
  }
}
