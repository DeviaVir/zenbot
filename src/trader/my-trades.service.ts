import crypto from 'crypto'
import { Collection } from 'mongodb'

interface MyTrade {
  _id: string
  id: string
  order_id: string
  time: number
  execution_time: number
  slippage: number
  type: string
  size: string
  fee: number
  price: string
  order_type: string
  selector: string
  session_id: string
  mode: string
}

interface MyTradesOptions {
  selector: string
  minPrevTrades: number
}

export class MyTradesService {
  public myTrades: MyTrade[] = []
  public myTradesSize: number = 0

  private myTradesCollection: Collection<MyTrade> = null

  constructor(private collectionServiceInstance: any, private opts: MyTradesOptions) {
    this.myTradesCollection = this.collectionServiceInstance.getMyTrades()
  }

  async getMyTrades(firststTradeTime: number) {
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

    this.myTradesSize = this.myTrades.length
  }

  async saveMyTrades(myTrades: MyTrade[], sessionId: string, mode: string) {
    await Promise.all(myTrades.map(async (myTrade) => await this.saveMyTrade(myTrade, sessionId, mode)))

    this.myTradesSize = this.myTrades.length
  }

  async saveMyTrade(myTrade: MyTrade, sessionId: string, mode: string) {
    myTrade.id = crypto.randomBytes(4).toString('hex')
    myTrade._id = myTrade.id
    myTrade.selector = this.opts.selector
    myTrade.session_id = sessionId
    myTrade.mode = mode

    await this.myTradesCollection.save(myTrade)
  }
}
