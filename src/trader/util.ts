import 'colors'

import minimist from 'minimist'
import objectifySelector from '../../lib/objectify-selector'
import path from 'path'

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
