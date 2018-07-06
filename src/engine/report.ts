import 'colors'

import moment from 'moment'
import readline from 'readline'
import { formatPercent, formatCurrency } from '../util/format'
import abbreviate from 'number-abbreviate'
import z from 'zero-fill'
import n from 'numbro'
import rsi from '../analysis/rsi'
import tb from 'timebucket'

export class Report {
  private assetColWidth: number = 0
  private depositColWidth: number = 0
  private currencyColWidth: number = 0

  writeReport = (s, isProgress?: boolean, blinkOff?: boolean) => {
    if ((s.options.mode === 'sim' || s.options.mode === 'train') && !s.options.verbose) {
      if (s.options.silent) return
      isProgress = true
    } else if (isProgress && typeof blinkOff === 'undefined' && s.vol_since_last_blink) {
      s.vol_since_last_blink = 0

      setTimeout(() => this.writeReport(s, true, true), 200)
      setTimeout(() => this.writeReport(s, true, false), 400)
      setTimeout(() => this.writeReport(s, true, true), 600)
      setTimeout(() => this.writeReport(s, true, false), 800)
    }

    this.clearLine()

    const lines = []

    const time = this.getTime(s, isProgress, blinkOff)
    const currency = this.getCurrency(s)
    const percentage = this.getPercentChange(s)
    const volume = this.getVolume(s, isProgress, blinkOff)
    const rsi = this.getRsi(s)
    const strategy = this.getStrategy(s)
    const signal = this.getSignal(s)
    const capital = this.getCapital(s)

    lines.push(time)
    lines.push(currency)
    lines.push(percentage)
    lines.push(volume)
    lines.push(rsi)
    lines.push(...strategy)
    lines.push(signal)
    lines.push(...capital)

    if (!isProgress) lines.push('\n')

    this.writeLine(lines.join(''))
  }

  private getCurrency(s: any) {
    return `   ${formatCurrency(s.period.close, s.currency, true, true, true)} ${s.product_id.grey}`
  }

  private getTime(
    { period: { latest_trade_time, time }, options: { period_length } }: any,
    isProgress: boolean,
    blinkOff: boolean
  ): string {
    const baseTime = isProgress
      ? latest_trade_time
      : tb(time)
          .resize(period_length)
          .add(1)
          .toMilliseconds()

    return moment(baseTime).format('YYYY-MM-DD HH:mm:ss')[isProgress && !blinkOff ? 'bgBlue' : 'grey']
  }

  private getPercentChange(s: any) {
    if (s.lookback[0]) {
      let diff = (s.period.close - s.lookback[0].close) / s.lookback[0].close
      return z(8, formatPercent(diff), ' ')[diff >= 0 ? 'green' : 'red']
    } else {
      return z(9, '', ' ')
    }
  }

  private getVolume(s: any, isProgress: boolean, blinkOff: boolean) {
    let volume = s.period.volume > 99999 ? abbreviate(s.period.volume, 2) : n(s.period.volume).format('0')
    volume = z(8, volume, ' ')

    if (volume.indexOf('.') === -1) volume = ` ${volume}`

    return isProgress && blinkOff ? volume.cyan : volume.grey
  }

  private getRsi(s: any) {
    rsi(s, 'rsi', s.options.rsi_periods)

    if (typeof s.period.rsi === 'number') {
      let half = 5
      let bar = ''
      let stars = 0
      let rsi = n(s.period.rsi).format('00.00') as any
      if (s.period.rsi >= 50) {
        stars = Math.min(Math.round(((s.period.rsi - 50) / 50) * half) + 1, half)
        bar += ' '.repeat(half - (rsi < 100 ? 3 : 4))
        bar += rsi.green + ' '
        bar += '+'.repeat(stars).green.bgGreen
        bar += ' '.repeat(half - stars)
      } else {
        stars = Math.min(Math.round(((50 - s.period.rsi) / 50) * half) + 1, half)
        bar += ' '.repeat(half - stars)
        bar += '-'.repeat(stars).red.bgRed
        bar += rsi.length > 1 ? ' ' : '  '
        bar += rsi.red
        bar += ' '.repeat(half - 3)
      }
      return ' ' + bar
    } else {
      return ' '.repeat(11)
    }
  }

  private getStrategy(s: any) {
    const lines = []
    if (s.strategy.onReport) {
      let cols = s.strategy.onReport.call(s.ctx, s)
      cols.forEach((col) => {
        lines.push(col)
      })
    }

    return lines
  }

  private getSignal(s: any) {
    if (s.buy_order) {
      return z(9, 'buying', ' ').green
    } else if (s.sell_order) {
      return z(9, 'selling', ' ').red
    } else if (s.action) {
      return z(9, s.action, ' ')[s.action === 'bought' ? 'green' : 'red']
    } else if (s.signal) {
      return z(9, s.signal || '', ' ')[s.signal ? (s.signal === 'buy' ? 'green' : 'red') : 'grey']
    } else if (s.last_trade_worth && !s.buy_order && !s.sell_order) {
      return z(8, formatPercent(s.last_trade_worth), ' ')[s.last_trade_worth > 0 ? 'green' : 'red']
    } else {
      return z(9, '', ' ')
    }
  }

  private getCapital(s: any) {
    const lines = []

    let orig_capital = s.orig_capital || s.start_capital
    let orig_price = s.orig_price || s.start_price
    if (orig_capital) {
      let asset_col = n(s.balance.asset).format(s.asset === 'BTC' ? '0.00000' : '0.00000000') + ' ' + s.asset
      this.assetColWidth = Math.max(asset_col.length + 1, this.assetColWidth)
      lines.push(z(this.assetColWidth, asset_col, ' ').white)
      let deposit_col = n(s.balance.deposit).format(this.isFiat(s.currency) ? '0.00' : '0.00000000') + ' ' + s.currency
      this.depositColWidth = Math.max(deposit_col.length + 1, this.depositColWidth)
      lines.push(z(this.depositColWidth, deposit_col, ' ').yellow)
      if (s.options.deposit) {
        let currency_col =
          n(s.balance.currency).format(this.isFiat(s.currency) ? '0.00' : '0.00000000') + ' ' + s.currency
        this.currencyColWidth = Math.max(currency_col.length + 1, this.currencyColWidth)
        lines.push(z(this.currencyColWidth, currency_col, ' ').green)
        let circulating = s.balance.currency > 0 ? n(s.balance.deposit).divide(s.balance.currency) : n(0)
        lines.push(z(8, n(circulating).format('0.00%'), ' ').grey)
      }
      let consolidated = n(s.net_currency).add(n(s.balance.asset).multiply(s.period.close))
      let profit = n(consolidated)
        .divide(orig_capital)
        .subtract(1)
        .value()
      lines.push(z(8, formatPercent(profit), ' ')[profit >= 0 ? 'green' : 'red'])
      let buy_hold = n(orig_capital)
        .divide(orig_price)
        .multiply(s.period.close)
      let over_buy_hold_pct = n(consolidated)
        .divide(buy_hold)
        .subtract(1)
        .value()
      lines.push(z(8, formatPercent(over_buy_hold_pct), ' ')[over_buy_hold_pct >= 0 ? 'green' : 'red'])
    }

    return lines
  }

  private clearLine() {
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
  }

  private writeLine(str: string) {
    process.stdout.write(str)
  }

  private isFiat(currency) {
    return !currency.match(/^BTC|ETH|XMR|USDT$/)
  }
}
