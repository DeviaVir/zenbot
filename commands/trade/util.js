const minimist = require('minimist')
const objectifySelector = require('../../lib/objectify-selector')
const z = require('zero-fill')
const crypto = require('crypto')

const makeOptions = (selector, argv, cmd, conf) => {
  const raw_opts = minimist(argv)
  const s = { options: JSON.parse(JSON.stringify(raw_opts)) }
  const so = s.options

  delete so._

  if (cmd.conf) {
    var overrides = require(path.resolve(process.cwd(), cmd.conf))
    Object.keys(overrides).forEach(function(k) {
      so[k] = overrides[k]
    })
  }

  Object.keys(conf).forEach(function(k) {
    if (typeof cmd[k] !== 'undefined') {
      so[k] = cmd[k]
    }
  })

  so.currency_increment = cmd.currency_increment
  so.keep_lookback_periods = cmd.keep_lookback_periods
  so.use_prev_trades = cmd.use_prev_trades || conf.use_prev_trades
  so.min_prev_trades = cmd.min_prev_trades
  so.debug = cmd.debug
  so.stats = !cmd.disable_stats
  so.mode = so.paper ? 'paper' : 'live'

  so.order_type = !['maker', 'taker'].includes(so.order_type) ? 'maker' : so.order_type

  if (so.buy_max_amt) {
    console.log('--buy_max_amt is deprecated, use --deposit instead!\n'.red)
    so.deposit = so.buy_max_amt
  }

  so.selector = objectifySelector(selector || conf.selector)

  return { s, so }
}

const keyMap = new Map([
  ['b', 'limit'.grey + ' BUY'.green],
  ['B', 'market'.grey + ' BUY'.green],
  ['s', 'limit'.grey + ' SELL'.red],
  ['S', 'market'.grey + ' SELL'.red],
  ['c', 'cancel order'.grey],
  ['m', 'toggle MANUAL trade in LIVE mode ON / OFF'.grey],
  ['T', 'switch to \'Taker\' order type'.grey],
  ['M', 'switch to \'Maker\' order type'.grey],
  ['o', 'show current trade options'.grey],
  ['O', 'show current trade options in a dirty view (full list)'.grey],
  ['L', 'toggle DEBUG'.grey],
  ['P', 'print statistical output'.grey],
  ['X', 'exit program with statistical output'.grey],
  ['d', 'dump statistical output to HTML file'.grey],
  ['D', 'toggle automatic HTML dump to file'.grey],
])

const listKeys = () => {
  console.log('\nAvailable command keys:')
  keyMap.forEach((value, key) => {
    console.log(' ' + key + ' - ' + value)
  })
}

// prettier-ignore
const listOptions = (s, so) => {
  console.log()
  console.log(s.exchange.name.toUpperCase() + ' exchange active trading options:'.grey)
  console.log()

  process.stdout.write(z(22, 'STRATEGY'.grey, ' ') +
    '\t' +
    so.strategy +
    '\t' +
    require(`../../extensions/strategies/${so.strategy}/strategy`).description.grey)
  console.log('\n')

  process.stdout.write([
    z(24, (so.mode === 'paper' ? so.mode.toUpperCase() : so.mode.toUpperCase()) + ' MODE'.grey, ' '),
    z(26, 'PERIOD'.grey, ' '),
    z(30, 'ORDER TYPE'.grey, ' '),
    z(28, 'SLIPPAGE'.grey, ' '),
    z(33, 'EXCHANGE FEES'.grey, ' '),
  ].join('') + '\n')

  process.stdout.write([
    z(15, so.mode === 'paper'
      ? '      '
      : so.mode === 'live' && (so.manual === false || typeof so.manual === 'undefined')
        ? '       ' + 'AUTO'.black.bgRed + '    '
        : '       ' + 'MANUAL'.black.bgGreen + '  ', ' '),
    z(13, so.period_length, ' '),
    z(29, so.order_type === 'maker' ? so.order_type.toUpperCase().green : so.order_type.toUpperCase().red, ' '),
    z(31, so.mode === 'paper' ? 'avg. '.grey + so.avg_slippage_pct + '%' : 'max '.grey + so.max_slippage_pct + '%', ' '),
    z(20, so.order_type === 'maker'
      ? so.order_type + ' ' + s.exchange.makerFee
      : so.order_type + ' ' + s.exchange.takerFee, ' '),
  ].join('') + '\n')

  process.stdout.write('')

  process.stdout.write([
    z(19, 'BUY %'.grey, ' '),
    z(20, 'SELL %'.grey, ' '),
    z(35, 'TRAILING STOP %'.grey, ' '),
    z(33, 'TRAILING DISTANCE %'.grey, ' '),
  ].join('') + '\n')

  process.stdout.write([
    z(9, so.buy_pct + '%', ' '),
    z(9, so.sell_pct + '%', ' '),
    z(20, so.profit_stop_enable_pct + '%', ' '),
    z(20, so.profit_stop_pct + '%', ' '),
  ].join('') + '\n')

  process.stdout.write('')
}

const makeMarker = (selector) => {
  const id = crypto.randomBytes(4).toString('hex')

  const marker = {
    id,
    _id: crypto.randomBytes(4).toString('hex'),
    selector,
    from: null,
    to: null,
    oldest_time: null,
  }
}

module.exports = { makeOptions, listKeys, listOptions, makeMarker }
