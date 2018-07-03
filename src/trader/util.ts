import minimist from 'minimist'
import objectifySelector from '../../lib/objectify-selector'
import crypto from 'crypto'
import path from 'path'

export const zeroFill = (width, number, pad) => {
  if (number === undefined) {
    return function(number, pad) {
      return zeroFill(width, number, pad)
    }
  }
  if (pad === undefined) pad = '0'
  width -= number.toString().length
  if (width > 0) return new Array(width + (/\./.test(number) ? 2 : 1)).join(pad) + number
  return number + ''
}

export const makeSettings = (selector, argv, cmd, conf) => {
  const raw_opts = minimist(argv)
  const settings = { options: JSON.parse(JSON.stringify(raw_opts)) }

  delete settings.options._

  if (cmd.conf) {
    var overrides = require(path.resolve(process.cwd(), cmd.conf))
    Object.keys(overrides).forEach(function(k) {
      settings.options[k] = overrides[k]
    })
  }

  Object.keys(conf).forEach(function(k) {
    if (typeof cmd[k] !== 'undefined') {
      settings.options[k] = cmd[k]
    }
  })

  settings.options.currency_increment = cmd.currency_increment
  settings.options.keep_lookback_periods = cmd.keep_lookback_periods
  settings.options.use_prev_trades = cmd.use_prev_trades || conf.use_prev_trades
  settings.options.min_prev_trades = cmd.min_prev_trades
  settings.options.debug = cmd.debug
  settings.options.stats = !cmd.disable_stats
  settings.options.mode = settings.options.paper ? 'paper' : 'live'

  settings.options.order_type = !['maker', 'taker'].includes(settings.options.order_type)
    ? 'maker'
    : settings.options.order_type

  if (settings.options.buy_max_amt) {
    console.log('--buy_max_amt is deprecated, use --deposit instead!\n'.red)
    settings.options.deposit = settings.options.buy_max_amt
  }

  settings.options.selector = objectifySelector(selector || conf.selector)

  return settings
}

const keyMap = new Map([
  ['b', 'limit'.grey + ' BUY'.green],
  ['B', 'market'.grey + ' BUY'.green],
  ['s', 'limit'.grey + ' SELL'.red],
  ['S', 'market'.grey + ' SELL'.red],
  ['c', 'cancel order'.grey],
  ['m', 'toggle MANUAL trade in LIVE mode ON / OFF'.grey],
  ['T', "switch to 'Taker' order type".grey],
  ['M', "switch to 'Maker' order type".grey],
  ['o', 'show current trade options'.grey],
  ['O', 'show current trade options in a dirty view (full list)'.grey],
  ['L', 'toggle DEBUG'.grey],
  ['P', 'print statistical output'.grey],
  ['X', 'exit program with statistical output'.grey],
  ['d', 'dump statistical output to HTML file'.grey],
  ['D', 'toggle automatic HTML dump to file'.grey],
])

export const listKeys = () => {
  console.log('\nAvailable command keys:')
  keyMap.forEach((value, key) => {
    console.log(' ' + key + ' - ' + value)
  })
}

// prettier-ignore
export const listOptions = (s, so) => {
  console.log()
  console.log(s.exchange.name.toUpperCase() + ' exchange active trading options:'.grey)
  console.log()

  process.stdout.write(zeroFill(22, 'STRATEGY'.grey, ' ') +
    '\t' +
    so.strategy +
    '\t' +
    require(`../../extensions/strategies/${so.strategy}/strategy`).description.grey)
  console.log('\n')

  process.stdout.write([
    zeroFill(24, (so.mode === 'paper' ? so.mode.toUpperCase() : so.mode.toUpperCase()) + ' MODE'.grey, ' '),
    zeroFill(26, 'PERIOD'.grey, ' '),
    zeroFill(30, 'ORDER TYPE'.grey, ' '),
    zeroFill(28, 'SLIPPAGE'.grey, ' '),
    zeroFill(33, 'EXCHANGE FEES'.grey, ' '),
  ].join('') + '\n')

  process.stdout.write([
    zeroFill(15, so.mode === 'paper'
      ? '      '
      : so.mode === 'live' && (so.manual === false || typeof so.manual === 'undefined')
        ? '       ' + 'AUTO'.black.bgRed + '    '
        : '       ' + 'MANUAL'.black.bgGreen + '  ', ' '),
    zeroFill(13, so.period_length, ' '),
    zeroFill(29, so.order_type === 'maker' ? so.order_type.toUpperCase().green : so.order_type.toUpperCase().red, ' '),
    zeroFill(31, so.mode === 'paper' ? 'avg. '.grey + so.avg_slippage_pct + '%' : 'max '.grey + so.max_slippage_pct + '%', ' '),
    zeroFill(20, so.order_type === 'maker'
      ? so.order_type + ' ' + s.exchange.makerFee
      : so.order_type + ' ' + s.exchange.takerFee, ' '),
  ].join('') + '\n')

  process.stdout.write('')

  process.stdout.write([
    zeroFill(19, 'BUY %'.grey, ' '),
    zeroFill(20, 'SELL %'.grey, ' '),
    zeroFill(35, 'TRAILING STOP %'.grey, ' '),
    zeroFill(33, 'TRAILING DISTANCE %'.grey, ' '),
  ].join('') + '\n')

  process.stdout.write([
    zeroFill(9, so.buy_pct + '%', ' '),
    zeroFill(9, so.sell_pct + '%', ' '),
    zeroFill(20, so.profit_stop_enable_pct + '%', ' '),
    zeroFill(20, so.profit_stop_pct + '%', ' '),
  ].join('') + '\n')

  process.stdout.write('')
}

export const makeMarker = (selector) => {
  const id = crypto.randomBytes(4).toString('hex')

  const marker = {
    id,
    _id: crypto.randomBytes(4).toString('hex'),
    selector,
    from: null,
    to: null,
    oldest_time: null,
  }

  return marker
}
