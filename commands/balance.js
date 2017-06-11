var minimist = require('minimist')
  , n = require('numbro')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('balance [selector]')
      .allowUnknownOption()
      .description('get asset and currency balance from the exchange')
      //.option('--all', 'output all balances')
      .option('--debug', 'output detailed debug info')
      .action(function (selector, cmd) {
        var s = {options: minimist(process.argv)}
        s.selector = get('lib.normalize-selector')(selector || c.selector)
        var exch = s.selector.split('.')[0]
        s.exchange = get('exchanges.' + exch)
        s.product_id = s.selector.split('.')[1]
        s.asset = s.product_id.split('-')[0]
        s.currency = s.product_id.split('-')[1]
        var so = s.options
        delete so._
        Object.keys(c).forEach(function (k) {
          if (typeof cmd[k] !== 'undefined') {
            so[k] = cmd[k]
          }
        })
        so.debug = cmd.debug
        function balance () {
          s.exchange.getBalance(s, function (err, balance) {
            if (err) throw err
            s.exchange.getQuote(s, function (err, quote) {
              if (err) throw err
              var bal = s.product_id + ' Asset: ' + balance.asset + ' Currency: ' + balance.currency + ' Total: ' + n(balance.asset).multiply(quote.ask).add(balance.currency).value()
              console.log(bal)
              process.exit()
            })
          })
        }
        balance()
      })
  }
}
