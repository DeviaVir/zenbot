import crypto from 'crypto'
import { Collection } from 'mongodb'
import { MarkerService, Marker } from './marker.service'

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

interface Trade {
  id: string
  _id: string
  trade_id: string
  time: number
  size: number
  price: number
  side: 'sell' | 'buy'
  selector: string
}

interface TradesOptions {
  selector: Record<string, string>
  usePrevTrades: boolean
  startTime: string
  sort?: { [key: string]: 1 | -1 }
  limit?: number
}

export class TradesService {
  private dbCursor: number = null
  private tradeCursor: number = null
  private allTradesCollection: Collection<Trade> = null

  private markerService: MarkerService
  private marker: Marker

  constructor(private collectionServiceInstance: any, private exchange: Exchange, private opts: TradesOptions) {
    this.allTradesCollection = this.collectionServiceInstance.getTrades()
    this.markerService = new MarkerService(this.collectionServiceInstance, this.opts.selector.normalized)
    this.marker = this.markerService.newMarker()

    if (!this.opts.sort) this.opts.sort = { time: 1 }
    if (!this.opts.limit) this.opts.limit = 1000
  }

  async getNext() {
    const query = {
      selector: this.opts.selector.normalized,
      time: !this.dbCursor ? { $gte: this.opts.startTime } : { $gt: this.dbCursor },
    }

    const trades = await this.allTradesCollection
      .find(query)
      .sort(this.opts.sort)
      .limit(this.opts.limit)
      .toArray()

    if (!trades.length) return []

    if (this.opts.usePrevTrades) {
      // await this.getMyTrades(trades[0].time)
    }

    const lastTrade = trades[trades.length - 1]
    this.dbCursor = lastTrade.time
    this.tradeCursor = this.exchange.getCursor(lastTrade)

    return trades.concat(await this.getNext())
  }

  async getTrades() {
    const opts = {
      product_id: this.opts.selector.product_id,
      from: this.tradeCursor,
    }

    const trades = ((await new Promise((resolve, reject) =>
      this.exchange.getTrades(opts, (err, trades) => (err ? reject(err) : resolve(trades)))
    )) as Trade[]).sort(({ time: a }, { time: b }) => (a === b ? 0 : a > b ? -1 : 1))

    trades.forEach((trade) => {
      const tradeCursor = this.exchange.getCursor(trade)
      this.tradeCursor = Math.max(tradeCursor, this.tradeCursor)
      this.saveTrade(trade)
    })

    this.markerService.saveMarker(this.marker)

    return trades
  }

  async saveTrade(trade: Trade) {
    const tradeData = {
      ...trade,
      selector: this.opts.selector,
      id: `selector-${trade.trade_id}`,
    }

    if (!this.marker.from) {
      this.marker.from = this.tradeCursor
      this.marker.oldest_time = trade.time
      this.marker.newest_time = trade.time
    }

    this.marker.to = this.marker.to ? Math.max(this.marker.to, this.tradeCursor) : this.tradeCursor
    this.marker.newest_time = Math.max(this.marker.newest_time, trade.time)

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
