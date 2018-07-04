import { Collection } from 'mongodb'
import tb from 'timebucket'
import Bucket from 'timebucket/lib/bucket'

import { makeSettings } from './util'
import engineFactory from '../../lib/engine'
import collectionService from '../../lib/services/collection-service'
import { TradesService } from './trades.service'
import { SessionService } from './session'
import { Balance } from './balance'

export class Trader {
  private initialized: boolean = false
  private settings: Record<string, any> = {}

  private engine: {
    writeHeader: () => void
    update: (trades: any, is_preroll: any, cb: any) => void
    exit: (cb: any) => void
    executeSignal: (signal: any, _cb: any, size: any, is_reorder: any, is_taker: any) => void
    writeReport: (is_progress: any, blink_off: any) => void
    syncBalance: (cb: any) => void
  }

  private collectionServiceInstance: {
    getTrades: () => any
    getResumeMarkers: () => any
    getBalances: () => any
    getSessions: () => any
    getPeriods: () => any
    getMyTrades: () => any
    getSimResults: () => any
  }

  private tradesService: TradesService

  private sessions: Collection
  private session: SessionService

  constructor(selector: string, argv: string[], cmd: Record<string, any>, private conf: Record<string, any>) {
    this.settings = makeSettings(selector, argv, cmd, conf)

    this.engine = engineFactory(this.settings, conf)
    this.collectionServiceInstance = collectionService(conf)

    const {
      selector: { normalized },
      use_prev_trades: usePrevTrades,
      min_prev_trades: minPrevTrades,
      period_length,
      min_periods,
    } = this.settings.options

    const startTime = (tb() as Bucket)
      .resize(period_length)
      .subtract(min_periods * 2)
      .toMilliseconds()

    const tradeOpts = { selector: normalized, usePrevTrades, minPrevTrades, startTime }
    this.tradesService = new TradesService(this.collectionServiceInstance, this.settings.exchange, tradeOpts)
  }

  init() {
    if (this.initialized) return
    this.initialized = true
    this.engine.writeHeader()

    this.tick()
  }

  private async createSession() {
    const {
      mode,
      reset_profit,
      selector: { selector },
      orig_capital,
      orig_price,
      start_capital,
      start_price,
      deposit,
      currency,
      asset,
      close,
    } = this.settings.options

    const opts = {
      balanceSnapshotPeriod: this.conf.balance_snapshot_period,
      selector,
      mode,
      orig_capital,
      orig_price,
      start_capital,
      start_price,
      deposit,
      currency,
      asset,
      close,
      options: this.settings.options,
    }

    this.session = new SessionService(opts)

    const [session] = await this.sessions
      .find({ selector: this.settings.selector.normalized })
      .limit(1)
      .sort({ started: -1 })
      .toArray()

    if (session && !reset_profit) {
      const {
        orig_capital,
        orig_price,
        deposit: prev_deposit,
        currency_capital,
        asset_capital,
        balance: { asset, currency },
        price,
        time,
      } = session

      const isMatch = orig_capital && orig_price && deposit === prev_deposit
      const isPaper = mode === 'paper' && !currency_capital && !asset_capital
      const isLive = mode === 'live' && asset == this.session.balance.asset && currency == this.session.balance.currency

      if (isMatch && (isPaper || isLive)) {
        this.session.balance = new Balance(opts.balanceSnapshotPeriod, selector)
        this.session.balance.next({ currency, asset, close: price, orig_capital, orig_price, time })
      }
    }
  }

  private async tick() {
    const trades = await this.tradesService.getNext()

    await new Promise((resolve, reject) => this.engine.update(trades, true, (err) => (err ? reject() : resolve())))

    setImmediate(this.tick)
  }
}
