var minimist = require('minimist')
  , n = require('numbro')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('buy [selector]')
      .allowUnknownOption()
      .description('execute a buy order to the exchange')
      .option('--pct <pct>', 'buy with this % of currency balance', Number, c.buy_pct)
      .option('--order_type <type>', 'order type to use (maker/taker)', /^(maker|taker)$/i, c.order_type)
      .option('--size <size>', 'buy specific size of currency')
      .option('--markdown_buy_pct <pct>', '% to mark down buy price', Number, c.markdown_buy_pct)
      .option('--order_adjust_time <ms>', 'adjust bid on this interval to keep order competitive', Number, c.order_adjust_time)
      .option('--max_slippage_pct <pct>', 'avoid buying at a slippage pct above this float', c.max_slippage_pct)
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
        so.buy_pct = cmd.pct
        so.selector = get('lib.normalize-selector')(selector || c.selector)
        var order_types = ['maker', 'taker']
        if (!so.order_type in order_types || !so.order_type) {
          so.order_type = 'maker'
        }
        so.mode = 'live'
        so.strategy = c.strategy
        so.stats = true
        var engine = get('lib.engine')(s)
        engine.executeSignal('buy', function (err, order) {
          if (err) {
            console.error(err)
            process.exit(1)
          }
          if (!order) {
            console.error('not enough currency balance to buy!')
          }
          process.exit()
        }, cmd.size)
        function checkOrder () {
          if (s.api_order) {
            s.exchange.getQuote({product_id: s.product_id}, function (err, quote) {
              if (err) {
                throw err
              }
              console.log('order status: '.grey + s.api_order.status.green + ', bid: '.grey + n(s.api_order.price).format('0.00000000').yellow + ', '.grey + n(quote.bid).subtract(s.api_order.price).format('0.00000000').red + ' below best bid, '.grey + n(s.api_order.filled_size).divide(s.api_order.size).format('0.0%').green + ' filled'.grey)
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
