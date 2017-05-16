var minimist = require('minimist')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('sell [selector]')
      .allowUnknownOption()
      .description('execute a sell order to the exchange')
      .option('--pct <pct>', 'sell with this % of currency balance', Number, c.sell_pct)
      .option('--size <size>', 'sell specific size of currency')
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
        so.sell_pct = cmd.pct
        so.selector = get('lib.normalize-selector')(selector || c.selector)
        so.mode = 'live'
        so.strategy = c.strategy
        so.stats = true
        var engine = get('lib.engine')(s)
        engine.executeSignal('sell', function (err, order) {
          if (err) {
            if (err.desc) console.error(err.desc)
            if (err.body) console.error(err.body)
            throw err
          }
          if (!order) {
            console.error('not enough asset balance to sell!')
          }
          process.exit()
        }, cmd.size)
        function checkOrder () {
          if (s.api_order) {
            s.exchange.getQuote({product_id: s.product_id}, function (err, quote) {
              if (err) {
                throw err
              }
              console.log('order status: ' + s.api_order.status + ', ask: ' + n(s.api_order.price).format('0.00') + ', ' + n(s.api_order.price).subtract(quote.ask).format('0.00') + ' above best ask, ' + n(s.api_order.filled_size).divide(s.api_order.size).format('0.00%') + ' filled')
            })
          }
          else {
            console.log('placing order...')
          }
        }
        setInterval(checkOrder, c.order_poll_time)
      })
  }
}