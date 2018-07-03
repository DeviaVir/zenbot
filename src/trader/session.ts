import crypto from 'crypto'
import { Balance } from './balance'

interface SessionOptions {
  balanceSnapshotPeriod: number
  selector: string
  mode: string
  orig_capital: string
  orig_price: string
  start_capital: string
  start_price: string
  deposit: string
  options: string
  currency: number
  asset: number
  close: number
}

export class SessionService {
  public id: string
  public started: number
  public updated: string
  public numTrades: string

  public balance: Balance

  constructor(private opts: SessionOptions) {
    this.id = crypto.randomBytes(4).toString('hex')
    this.started = new Date().getTime()

    this.balance = new Balance(this.opts.balanceSnapshotPeriod, this.opts.selector)
    this.balance.next(this.opts)
  }
}
