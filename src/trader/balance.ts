import tb from 'timebucket'
import Bucket from 'timebucket/lib/bucket'
import n from 'numbro'

export class Balance {
  public id: string
  public time: string
  public currency: string
  public asset: string
  public price: number
  public start_capital: number
  public start_price: number
  public consolidated: number
  public profit: number
  public buyHold: number
  public buyHoldProfit: number
  public vsBuyHold: number

  constructor(private readonly balanceSnapshotPeriod: number, private readonly selector: string) {
    const d = (tb() as Bucket).resize(this.balanceSnapshotPeriod)
    this.id = `${this.selector}-${d.toString()}`
  }

  next({ currency, asset, close, orig_capital, orig_price, time = null }) {
    this.time = time ? time : (tb() as Bucket).resize(this.balanceSnapshotPeriod).toMilliseconds()

    this.currency = currency
    this.asset = asset
    this.price = close

    this.start_capital = orig_capital
    this.start_price = orig_price

    this.consolidated = n(asset)
      .multiply(close)
      .add(currency)
      .value()

    this.profit = (this.consolidated - orig_capital) / orig_capital
    this.buyHold = close * (orig_capital / orig_price)
    this.buyHoldProfit = (this.buyHold - orig_capital) / orig_capital
    this.vsBuyHold = (this.consolidated - this.buyHold) / this.buyHold
  }
}
