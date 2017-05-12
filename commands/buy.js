var minimist = require('minimist')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('buy [selector]')
      .allowUnknownOption()
      .description('execute a buy order to the exchange')
      .option('--buy_pct <pct>', 'buy with this % of currency balance', Number, c.buy_pct)
      .option('--markup_pct <pct>', '% to mark up ask price', Number, c.markup_pct)
      .option('--order_adjust_time <ms>', 'adjust bid on this interval to keep order competitive', Number, c.order_adjust_time)
      .option('--max_slippage_pct <pct>', 'avoid selling at a slippage pct above this float', c.max_slippage_pct)
      .action(function (selector, cmd) {
        var s = {options: minimist(process.argv)}
        var so = s.options
        delete so._
        Object.keys(c).forEach(function (k) {
          if (typeof cmd[k] !== 'undefined') {
            so[k] = cmd[k]
          }
        })
        so.selector = get('lib.normalize-selector')(selector || c.selector)
        so.mode = 'live'
        so.strategy = c.strategy
        so.stats = true
        var engine = get('lib.engine')(s)
        engine.executeSignal('buy', function (err, order) {
          if (err) {
            if (err.desc) console.error(err.desc)
            if (err.body) console.error(err.body)
            throw err
          }
          process.exit()
        })
      })
  }
}