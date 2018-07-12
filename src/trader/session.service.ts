import crypto from 'crypto'
import { BalanceService, Balance } from './balance.service'
import { Collection } from 'mongodb'

interface Session {
  id: string
  _id: string
  started: number
  updated: number
  num_trades: string
  mode: string
  orig_capital: string
  orig_price: string
  start_capital: string
  start_price: string
  deposit: string
  options: string
  currency: number
  asset: number
  price: number
  balance: Balance
}

export class SessionService {
  public session: Session

  private sessionsCollection: Collection
  private balanceService: BalanceService
  private sessionId: string

  constructor(private s, collectionServiceInstance, balanceSnapshotPeriod: number, private selector: string) {
    this.sessionsCollection = collectionServiceInstance.getSessions()
    this.balanceService = new BalanceService(collectionServiceInstance, balanceSnapshotPeriod, selector)
    this.sessionId = crypto.randomBytes(4).toString('hex')
  }

  async loadLastSession(resetProfit: boolean) {
    const { selector } = this
    const sessions = await this.sessionsCollection
      .find({ selector })
      .limit(1)
      .sort({ started: -1 })
      .toArray()

    if (!sessions.length) return

    const [session] = sessions

    if (!resetProfit) {
      const hasOrigCapital = session.orig_capital && session.orig_price && session.deposit === this.s.options.deposit
      const isPaper =
        this.s.options.mode === 'paper' && !this.s.options.currency_capital && !this.s.options.asset_capital
      const isLive =
        this.s.options.mode === 'live' &&
        session.balance.asset == this.s.balance.asset &&
        session.balance.currency == this.s.balance.currency

      if (hasOrigCapital && (isPaper || isLive)) {
        this.s.orig_capital = session.orig_capital = session.orig_capital
        this.s.orig_price = session.orig_price = session.orig_price

        if (this.s.options.mode === 'paper') {
          this.s.balance = session.balance
        }
      }
    }

    if (this.s.lookback.length > this.s.options.keep_lookback_periods) {
      this.s.lookback.splice(-1, 1)
    }
  }

  async newSession() {
    if (!this.session) {
      this.session = {
        id: this.sessionId,
        _id: this.sessionId,
        options: this.s.options,
      } as Session
    }

    const session: Session = {
      ...this.session,
      updated: new Date().getTime(),
      balance: this.s.balance,
      num_trades: this.s.my_trades.length,
      start_capital: this.s.start_capital,
      start_price: this.s.start_price,
    }

    if (this.s.options.deposit) session.deposit = this.s.options.deposit
    if (!session.orig_capital) session.orig_capital = this.s.start_capital
    if (!session.orig_price) session.orig_price = this.s.start_price

    if (!this.s.period) {
      session.balance = {
        currency: this.s.balance.currency,
        asset: this.s.balance.asset,
      } as Balance

      return session
    }

    const { currency, asset, price: close, orig_capital, orig_price } = session

    session.price = this.s.period.close
    session.balance = await this.balanceService.next({ currency, asset, close, orig_capital, orig_price })

    this.session = session
    return session
  }

  async saveSession() {
    const session = await this.newSession()

    await this.sessionsCollection.save(session)

    return session
  }
}
