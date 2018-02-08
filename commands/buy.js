var minimist = require('minimist')
  , n = require('numbro')
  // eslint-disable-next-line no-unused-vars
  , colors = require('colors')
  , objectifySelector = require('../lib/objectify-selector')
  , engineFactory = require('../lib/engine')

module.exports = function (program, conf) {
  program
    .command('buy [selector]')
    .allowUnknownOption()
    .description('execute a buy order to the exchange')
    .option('--pct <pct>', 'buy with this % of currency balance', Number, conf.buy_pct)
    .option('--order_type <type>', 'order type to use (maker/taker)', /^(maker|taker)$/i, conf.order_type)
    .option('--size <size>', 'buy specific size of currency')
    .option('--markdown_buy_pct <pct>', '% to mark down buy price', Number, conf.markdown_buy_pct)
    .option('--order_adjust_time <ms>', 'adjust bid on this interval to keep order competitive', Number, conf.order_adjust_time)
    .option('--order_poll_time <ms>', 'poll order status on this interval', Number, conf.order_poll_time)
    .option('--max_slippage_pct <pct>', 'avoid buying at a slippage pct above this float', conf.max_slippage_pct)
    .option('--debug', 'output detailed debug info')
    .action(function (selector, cmd) {
      var s = {options: minimist(process.argv)}
      var so = s.options
      delete so._
      Object.keys(conf).forEach(function (k) {
        if (typeof cmd[k] !== 'undefined') {
          so[k] = cmd[k]
        }
      })
      so.debug = cmd.debug
      so.buy_pct = cmd.pct
      so.selector = objectifySelector(selector || conf.selector)
      var order_types = ['maker', 'taker']
      if (!(so.order_type in order_types) || !so.order_type) {
        so.order_type = 'maker'
      }
      so.mode = 'live'
      so.strategy = conf.strategy
      so.stats = true
      var engine = engineFactory(s, conf)
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
      setInterval(checkOrder, conf.order_poll_time)
    })
}

