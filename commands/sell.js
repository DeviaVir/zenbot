var minimist = require('minimist')
  , n = require('numbro')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('sell [selector]')
      .allowUnknownOption()
      .description('execute a sell order to the exchange')
      .option('--pct <pct>', 'sell with this % of currency balance', Number, c.sell_pct)
      .option('--order_type <type>', 'order type to use (maker/taker)', /^(maker|taker)$/i, c.order_type)
      .option('--size <size>', 'sell specific size of currency')
      .option('--markup_sell_pct <pct>', '% to mark up sell price', Number, c.markup_sell_pct)
      .option('--order_adjust_time <ms>', 'adjust ask on this interval to keep order competitive', Number, c.order_adjust_time)
      .option('--order_poll_time <ms>', 'poll order status on this interval', Number, c.order_poll_time)
      .option('--max_slippage_pct <pct>', 'avoid selling at a slippage pct above this float', c.max_slippage_pct)
      .option('--debug', 'output detailed debug info')
      .action(function (selector, cmd) {
        var s = {options: minimist(process.argv)}
        var so = s.options
        delete so._
        Object.keys(c).forEach(function (k) {
          if (typeof cmd[k] !== 'undefined') {
            so[k] = cmd[k]
          }
        })
        so.debug = cmd.debug
        so.sell_pct = cmd.pct
        so.selector = get('lib.objectify-selector')(selector || c.selector)
        var order_types = ['maker', 'taker']
        if (!so.order_type in order_types || !so.order_type) {
          so.order_type = 'maker'
        }
        so.mode = 'live'
        so.strategy = c.strategy
        so.stats = true
        var engine = get('lib.engine')(s)
        engine.executeSignal('sell', function (err, order) {
          if (err) {
            console.error(err)
            process.exit(1)
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
              console.log('order status: '.grey + s.api_order.status.green + ', ask: '.grey + n(s.api_order.price).format('0.00000000').yellow + ', '.grey + n(s.api_order.price).subtract(quote.ask).format('0.00000000').red + ' above best ask, '.grey + n(s.api_order.filled_size).divide(s.api_order.size).format('0.0%').green + ' filled'.grey)
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
