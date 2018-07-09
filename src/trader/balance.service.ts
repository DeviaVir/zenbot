import tb from 'timebucket'
import Bucket from 'timebucket/lib/bucket'
import n from 'numbro'
import { Collection } from 'mongodb'

export interface Balance {
  id: string
  _id: string
  time: string
  currency: string
  asset: string
  price: number
  start_capital: number
  start_price: number
  consolidated: number
  profit: number
  buy_hold: number
  buy_hold_profit: number
  vs_buy_hold: number
}

export class BalanceService {
  public balance: Balance
  private balanceCollection: Collection<Balance>

  constructor(
    collectionServiceInstance,
    private readonly balanceSnapshotPeriod: number,
    private readonly selector: string
  ) {
    this.balanceCollection = collectionServiceInstance.getBalances()
  }

  next({ currency, asset, close, orig_capital, orig_price, time = null }) {
    const d = (tb() as Bucket).resize(this.balanceSnapshotPeriod)
    const id = `${this.selector}-${d.toString()}`
    const balance = {
      id,
      _id: id,
      time: time ? time : (tb() as Bucket).resize(this.balanceSnapshotPeriod).toMilliseconds(),
      currency: currency,
      asset: asset,
      price: close,
      start_capital: orig_capital,
      start_price: orig_price,
      consolidated: n(asset)
        .multiply(close)
        .add(currency)
        .value(),
      buy_hold: close * (orig_capital / orig_price),
    } as Balance

    balance.profit = (balance.consolidated - orig_capital) / orig_capital
    balance.buy_hold_profit = (balance.buy_hold - orig_capital) / orig_capital
    balance.vs_buy_hold = (balance.consolidated - balance.buy_hold) / balance.buy_hold

    this.balanceCollection.save(balance)

    return balance
  }
}
