import tb from 'timebucket'
import Bucket from 'timebucket/lib/bucket'
import { spawn } from 'child_process'
import path from 'path'

import { makeSettings } from './util'
import engineFactory from '../engine'
import collectionService from '../services/collection-service'
import { TradesService } from './trades.service'
import { SessionService } from './session.service'
import { QuoteResponse } from '../engine/quote'
import { PeriodService } from './period.service'
import { MyTradesService } from './my-trades.service'
import { ProcessService } from './process.service'
import { ReadlineService } from './readline.service'

export class Trader {
  private initialized: boolean = false
  private s: Record<string, any> = {}
  private startTime: any
  private lookbackSize: number = 0

  private engine: {
    writeHeader: () => void
    update: (trades: any, isPreroll: any, cb?: any) => void
    exit: (cb: any) => void
    executeSignal: (signal: any, initSize?: any, isReorder?: any, isTaker?: any) => Promise<void>
    writeReport: (s, isProgress?: boolean, blinkOff?: boolean) => void
    syncBalance: () => Promise<{
      balance: {
        asset: number
      }
      quote: QuoteResponse
    }>
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
  private myTradesService: MyTradesService
  private sessionService: SessionService
  private periodService: PeriodService
  private readlineService: ReadlineService
  private processService: ProcessService

  constructor(selector: string, argv: string[], private cmd: Record<string, any>, private conf: Record<string, any>) {
    this.s = makeSettings(selector, argv, cmd, conf)

    this.engine = engineFactory(this.s, conf)

    this.processService = new ProcessService(this.s)
    this.readlineService = new ReadlineService(this.s, this.engine, this.processService)

    this.collectionServiceInstance = collectionService(conf)

    const { period_length, min_periods } = this.s.options

    this.startTime = (tb() as Bucket)
      .resize(period_length)
      .subtract(min_periods * 2)
      .toMilliseconds()
  }

  async init() {
    if (this.initialized) return
    this.initialized = true
    await this.backFill()
    this.initServices()
    this.engine.writeHeader()

    const trades = await this.tradesService.getNext()
    await this.updateEngine(trades, true)
    await this.engine.syncBalance()

    this.s.session = await this.sessionService.saveSession()
    await this.sessionService.loadLastSession(this.cmd.reset_profit)

    this.tick()
    this.readlineService.init()
    this.saveStats()
  }

  private async backFill() {
    const days = Math.ceil((new Date().getTime() - this.startTime) / 86400000)

    const zenbotCmd = process.platform === 'win32' ? 'zenbot.bat' : 'zenbot.sh'
    const cmdPath = path.resolve(this.conf.srcRoot, '..', zenbotCmd)
    const commandArgs = ['backfill', this.s.options.selector.normalized, '--days', days || 1]

    if (this.cmd.conf) commandArgs.push('--conf', this.cmd.conf)

    const backfiller = spawn(cmdPath, commandArgs)
    backfiller.stdout.pipe(process.stdout)
    backfiller.stderr.pipe(process.stderr)

    return new Promise((resolve) => backfiller.on('exit', (code) => (code ? process.exit(code) : resolve())))
  }

  private async updateEngine(trades, isPreroll: boolean = false) {
    await new Promise((resolve, reject) => this.engine.update(trades, isPreroll, (err) => (err ? reject() : resolve())))
  }

  private initServices() {
    this.initSession()
    this.initMyTrades()
    this.initTrades()
    this.initPeriod()
  }

  private async initSession() {
    const { normalized: selector } = this.s.options.selector

    this.sessionService = new SessionService(
      this.s,
      this.collectionServiceInstance,
      this.conf.balance_snapshot_period,
      selector
    )
  }

  private initTrades() {
    const { selector, use_prev_trades: usePrevTrades } = this.s.options

    const tradeOpts = { selector, usePrevTrades, startTime: this.startTime }
    this.tradesService = new TradesService(this.collectionServiceInstance, this.s.exchange, tradeOpts)
  }

  private initMyTrades() {
    const {
      selector: { normalized: selector },
      min_prev_trades: minPrevTrades,
    } = this.s.options

    this.myTradesService = new MyTradesService(this.collectionServiceInstance, { selector, minPrevTrades })
  }

  private initPeriod() {
    this.periodService = new PeriodService(this.collectionServiceInstance, this.s.options.selector.normalized)
  }

  private tick = async () => {
    const trades = await this.tradesService.getTrades()
    if (!trades.length) {
      return await this.saveSession()
    }

    await this.updateEngine(trades)

    if (this.s.my_trades.length > this.myTradesService.myTradesSize) {
      const myTrades = this.s.my_trades.slice(this.myTradesService.myTradesSize)
      await this.myTradesService.saveMyTrades(myTrades, this.s.session.id, this.s.options.mode)
    }

    if (this.s.lookback.length > this.lookbackSize) {
      await this.periodService.savePeriod(this.s.lookback[0], this.s.session.id)
      this.lookbackSize = this.s.lookback.length
    }

    if (this.s.period) await this.periodService.savePeriod(this.s.period, this.s.session.id)
    this.processService.dump(true)

    await this.saveSession()
  }

  private async saveSession() {
    await this.engine.syncBalance()
    await this.sessionService.saveSession()

    if (this.s.period) this.engine.writeReport(this.s)

    setTimeout(this.tick, this.s.options.poll_trades)
  }

  private saveStats() {
    if (!this.s.options.save_stats) return setTimeout(() => this.saveStats(), 10000)

    this.processService.dump(false, true)
    setTimeout(() => this.saveStats(), 10000)
  }
}
