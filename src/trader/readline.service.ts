import 'colors'

import readline from 'readline'
import cliff from 'cliff'
import z from 'zero-fill'

import * as debug from '../engine/debug'
import { ProcessService } from './process.service'

const keyMap = new Map()
keyMap.set('b', 'limit'.grey + ' BUY'.green)
keyMap.set('B', 'market'.grey + ' BUY'.green)
keyMap.set('s', 'limit'.grey + ' SELL'.red)
keyMap.set('S', 'market'.grey + ' SELL'.red)
keyMap.set('c', 'cancel order'.grey)
keyMap.set('m', 'toggle MANUAL trade in LIVE mode ON / OFF'.grey)
keyMap.set('T', "switch to 'Taker' order type".grey)
keyMap.set('M', "switch to 'Maker' order type".grey)
keyMap.set('o', 'show current trade options'.grey)
keyMap.set('O', 'show current trade options in a dirty view (full list)'.grey)
keyMap.set('L', 'toggle DEBUG'.grey)
keyMap.set('P', 'print statistical output'.grey)
keyMap.set('X', 'exit program with statistical output'.grey)
keyMap.set('d', 'dump statistical output to HTML file'.grey)
keyMap.set('D', 'toggle automatic HTML dump to file'.grey)

export class ReadlineService {
  private keyCommands: Map<string, () => void> = new Map([
    ['l', () => this.listKeys()],
    ['b', () => this.buy()],
    ['B', () => this.buy(true)],
    ['s', () => this.sell()],
    ['S', () => this.sell(true)],
    ['c', () => this.cancel()],
    ['C', () => this.cancel()],
    ['m', () => this.toggleManual()],
    ['T', () => this.setMakerTaker('taker')],
    ['M', () => this.setMakerTaker('maker')],
    ['o', () => this.listOptions()],
    ['O', () => this.inspect()],
    ['P', () => this.printStats()],
    ['X', () => this.exit()],
    ['d', () => this.dumpStats()],
    ['D', () => this.toggleStats()],
    ['L', () => this.toggleDebug()],
  ])

  constructor(private s, private engine, private processService: ProcessService) {
    readline.emitKeypressEvents(process.stdin)
  }

  init() {
    // prettier-ignore
    const head = '------------------------------------------ INITIALIZE OUTPUT ------------------------------------------'
    console.log(head)

    const minuses = Math.floor((head.length - this.s.options.mode.length - 19) / 2)

    // prettier-ignore
    console.log('-'.repeat(minuses) + ' STARTING ' + this.s.options.mode.toUpperCase() + ' TRADING ' + '-'.repeat(minuses + (minuses % 2 == 0 ? 0 : 1)))

    if (this.s.options.mode === 'paper') {
      // prettier-ignore
      console.log('!!! Paper mode enabled. No real trades are performed until you remove --paper from the startup command.')
    }

    console.log('Press ' + ' l '.inverse + ' to list available commands.')

    if (!this.s.options.non_interactive && process.stdin.setRawMode) {
      process.stdin.setRawMode(true)
      process.stdin.on('keypress', (key, info) => this.handleOnKey(key, info))
    }
  }

  private handleOnKey(key: string, info) {
    if (!info.ctrl && this.keyCommands.has(key)) this.keyCommands.get(key)()
    if (info.name === 'c' && info.ctrl) process.exit()
  }

  private listKeys() {
    console.log('\nAvailable command keys:')
    keyMap.forEach((value, key) => {
      console.log(' ' + key + ' - ' + value)
    })
  }

  private buy(isTaker: boolean = false) {
    const msg = `\n${'manual'.grey} ${!isTaker ? 'limit' : 'market'} ${'BUY'.green} ${'command executed'.grey}`
    console.log(msg)
    !isTaker ? this.engine.executeSignal('buy') : this.engine.executeSignal('buy', null, null, false, true)
  }

  private sell(isTaker: boolean = false) {
    const msg = `\n${'manual'.grey} ${!isTaker ? 'limit' : 'market'} ${'SELL'.red} ${'command executed'.grey}`
    !isTaker ? this.engine.executeSignal('sell') : this.engine.executeSignal('sell', null, null, false, true)
    console.log(msg)
  }

  private cancel() {
    delete this.s.buy_order
    delete this.s.sell_order
    console.log('\nmanual'.grey + ' order cancel' + ' command executed'.grey)
  }

  private toggleManual() {
    if (this.s.options.mode !== 'live') return

    this.s.options.manual = !this.s.options.manual
    console.log('\nMANUAL trade in LIVE mode: ' + (this.s.options.manual ? 'ON'.green.inverse : 'OFF'.red.inverse))
  }

  private setMakerTaker(type: 'maker' | 'taker') {
    const msg = type === 'maker' ? '\n' + 'Maker fees activated'.black.bgGreen : '\n' + 'Taker fees activated'.bgRed
    this.s.options.order_type = type
    console.log(msg)
  }

  private listOptions() {
    console.log('\n' + cliff.inspect(this.s.options))
  }

  private inspect() {
    console.log()
    console.log(this.s.exchange.name.toUpperCase() + ' exchange active trading options:'.grey)
    console.log()

    // prettier-ignore
    process.stdout.write(z(22, 'STRATEGY'.grey, ' ') + '\t' + this.s.options.strategy + '\t' + (require(`../extensions/strategies/${this.s.options.strategy}/strategy`).description).grey)
    console.log('\n')

    // prettier-ignore
    process.stdout.write([
      z(24, (this.s.options.mode === 'paper' ? this.s.options.mode.toUpperCase() : this.s.options.mode.toUpperCase()) + ' MODE'.grey, ' '),
      z(26, 'PERIOD'.grey, ' '),
      z(30, 'ORDER TYPE'.grey, ' '),
      z(28, 'SLIPPAGE'.grey, ' '),
      z(33, 'EXCHANGE FEES'.grey, ' ')
    ].join('') + '\n')

    // prettier-ignore
    process.stdout.write([
      z(15, (this.s.options.mode === 'paper' ? '      ' : (this.s.options.mode === 'live' && (this.s.options.manual === false || typeof this.s.options.manual === 'undefined')) ? '       ' + 'AUTO'.black.bgRed + '    ' : '       ' + 'MANUAL'.black.bgGreen + '  '), ' '),
      z(13, this.s.options.period_length, ' '),
      z(29, (this.s.options.order_type === 'maker' ? this.s.options.order_type.toUpperCase().green : this.s.options.order_type.toUpperCase().red), ' '),
      z(31, (this.s.options.mode === 'paper' ? 'avg. '.grey + this.s.options.avg_slippage_pct + '%' : 'max '.grey + this.s.options.max_slippage_pct + '%'), ' '),
      z(20, (this.s.options.order_type === 'maker' ? this.s.options.order_type + ' ' + this.s.exchange.makerFee : this.s.options.order_type + ' ' + this.s.exchange.takerFee), ' ')
    ].join('') + '\n')
    process.stdout.write('')

    // prettier-ignore
    process.stdout.write([
      z(19, 'BUY %'.grey, ' '),
      z(20, 'SELL %'.grey, ' '),
      z(35, 'TRAILING STOP %'.grey, ' '),
      z(33, 'TRAILING DISTANCE %'.grey, ' ')
    ].join('') + '\n')

    // prettier-ignore
    process.stdout.write([
      z(9, this.s.options.buy_pct + '%', ' '),
      z(9, this.s.options.sell_pct + '%', ' '),
      z(20, this.s.options.profit_stop_enable_pct + '%', ' '),
      z(20, this.s.options.profit_stop_pct + '%', ' ')
    ].join('') + '\n')
  }

  private printStats() {
    console.log('\nWriting statistics...'.grey)
    this.processService.dump()
  }

  private exit() {
    console.log('\nExiting... ' + '\nWriting statistics...'.grey)
    this.processService.quit()
  }

  private dumpStats() {
    console.log('\nDumping statistics...'.grey)
    this.processService.dump(false, true)
  }

  private toggleStats() {
    console.log('\nDumping statistics...'.grey)
    this.s.options.save_stats = !this.s.options.save_stats
  }

  private toggleDebug() {
    debug.flip()
    console.log('\nDEBUG mode: ' + (debug.on ? 'ON'.green.inverse : 'OFF'.red.inverse))
  }
}
