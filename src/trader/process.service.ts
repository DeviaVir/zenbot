import fs from 'fs'
import path from 'path'
import colors from 'colors'
import n from 'numbro'

export class ProcessService {
  constructor(private s) {}

  quit() {
    const tmp_balance = n(this.s.net_currency)
      .add(n(this.s.period.close).multiply(this.s.balance.asset))
      .format('0.00000000')

    if (this.s.my_trades.length) {
      this.s.my_trades.push({
        price: this.s.period.close,
        size: this.s.balance.asset,
        type: 'sell',
        time: this.s.period.time,
      })
    }
    this.s.balance.currency = tmp_balance
    this.s.balance.asset = 0
    this.s.lookback.unshift(this.s.period)

    this.dump(false, false)
    process.exit()
  }

  dump(statsonly: boolean = false, dumpOnly: boolean = true) {
    const tmp_balance = n(this.s.net_currency)
      .add(n(this.s.period.close).multiply(this.s.balance.asset))
      .format('0.00000000')
    const profit = this.s.start_capital
      ? n(tmp_balance)
          .subtract(this.s.start_capital)
          .divide(this.s.start_capital)
      : n(0)
    const buy_hold = this.s.start_price
      ? n(this.s.period.close).multiply(n(this.s.start_capital).divide(this.s.start_price))
      : n(tmp_balance)
    const buy_hold_profit = this.s.start_capital
      ? n(buy_hold)
          .subtract(this.s.start_capital)
          .divide(this.s.start_capital)
      : n(0)

    const output_lines = []
    // prettier-ignore
    output_lines.push('last balance: ' + n(tmp_balance).format('0.00000000').yellow + ' (' + profit.format('0.00%') + ')')
    // prettier-ignore
    output_lines.push('buy hold: ' + buy_hold.format('0.00000000').yellow + ' (' + n(buy_hold_profit).format('0.00%') + ')')
    // prettier-ignore
    output_lines.push('vs. buy hold: ' + n(tmp_balance).subtract(buy_hold).divide(buy_hold).format('0.00%').yellow)
    // prettier-ignore
    output_lines.push(this.s.my_trades.length + ' trades over ' + this.s.day_count + ' days (avg ' + n(this.s.my_trades.length / this.s.day_count).format('0.00') + ' trades/day)')

    this.s.stats = {
      profit: profit.format('0.00%'),
      tmp_balance: n(tmp_balance).format('0.00000000'),
      buy_hold: buy_hold.format('0.00000000'),
      buy_hold_profit: n(buy_hold_profit).format('0.00%'),
      day_count: this.s.day_count,
      trade_per_day: n(this.s.my_trades.length / this.s.day_count).format('0.00'),
    }

    let last_buy
    let losses = 0
    let sells = 0
    this.s.my_trades.forEach(function(trade) {
      if (trade.type === 'buy') {
        last_buy = trade.price
      } else {
        if (last_buy && trade.price < last_buy) {
          losses++
        }
        sells++
      }
    })

    if (this.s.my_trades.length && sells > 0) {
      if (!statsonly) {
        // prettier-ignore
        output_lines.push('win/loss: ' + (sells - losses) + '/' + losses)
        // prettier-ignore
        output_lines.push('error rate: ' + (sells ? n(losses).divide(sells).format('0.00%') : '0.00%').yellow)
      }

      //for API
      this.s.stats.win = sells - losses
      this.s.stats.losses = losses
      // prettier-ignore
      this.s.stats.error_rate = (sells ? n(losses).divide(sells).format('0.00%') : '0.00%')
    }

    if (!statsonly) {
      output_lines.forEach(function (line) {
        console.log(line)
      })
    }

    if (!statsonly && this.s.options.filename !== 'none') {
      this.writeToFile(output_lines, dumpOnly)
    }
  }

  private writeToFile(output_lines: string[], dump: boolean) {
    // prettier-ignore
    const html_output = output_lines.map((line) => {
      return colors.stripColors(line)
    }).join('\n')

    const data = this.s.lookback.slice(0, this.s.lookback.length - this.s.options.min_periods).map((period) => {
      const data = {}
      const keys = Object.keys(period)
      for (var i = 0; i < keys.length; i++) {
        data[keys[i]] = period[keys[i]]
      }
      return data
    })

    const code =
      'var data = ' + JSON.stringify(data) + ';\n' + 'var trades = ' + JSON.stringify(this.s.my_trades) + ';\n'
    const tpl = fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'sim_result.html.tpl'), { encoding: 'utf8' })

    const out = tpl
      .replace('{{code}}', code)
      .replace('{{trend_ema_period}}', this.s.options.trend_ema || 36)
      .replace('{{output}}', html_output)
      .replace(
        /\{\{symbol\}\}/g,
        this.s.options.selector.normalized + ' - zenbot ' + require('../package.json').version
      )

    let out_target
    const out_target_prefix = this.s.options.paper ? 'simulations/paper_result_' : 'stats/trade_result_'
    if (dump) {
      const dt = new Date().toISOString()
      const today = dt.slice(2, 4) + dt.slice(5, 7) + dt.slice(8, 10)
      // prettier-ignore
      out_target = this.s.options.filename || out_target_prefix + this.s.options.selector.normalized + '_' + today + '_UTC.html';
      fs.writeFileSync(out_target, out)
    } else {
      // prettier-ignore
      out_target = this.s.options.filename || out_target_prefix + this.s.options.selector.normalized + '_' + new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/-/g, '').replace(/:/g, '').replace(/20/, '') + '_UTC.html';
    }

    fs.writeFileSync(out_target, out)
    console.log('\nwrote'.grey, out_target)
  }
}
