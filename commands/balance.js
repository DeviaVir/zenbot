var minimist = require('minimist')
  , n = require('numbro')
  // eslint-disable-next-line no-unused-vars
  , colors = require('colors')
  , moment = require('moment')
  , objectifySelector = require('../lib/objectify-selector')
  , exchangeService = require('../lib/services/exchange-service')
  , { formatCurrency } = require('../lib/format')

module.exports = function (program, conf) {
  program
    .command('balance [selector]')
    .allowUnknownOption()
    .description('get asset and currency balance from the exchange')
    //.option('--all', 'output all balances')
    .option('-c, --calculate_currency <calculate_currency>', 'show the full balance in another currency')
    .option('--debug', 'output detailed debug info')
    .action(function (selector, cmd) {
      var s = {options: minimist(process.argv)}
      s.selector = objectifySelector(selector || conf.selector)
      s.product_id = s.selector.product_id
      s.asset = s.selector.asset
      s.currency = s.selector.currency

      var so = s.options
      delete so._

      Object.keys(conf).forEach(function (k) {
        if (typeof cmd[k] !== 'undefined') {
          so[k] = cmd[k]
        }
      })
      so.selector = s.selector
      so.debug = cmd.debug
      so.mode = 'live'
      function balance () {
        var exchangeServiceInstance = exchangeService(conf)
        var exchange = exchangeServiceInstance.getExchange()

        var exchangeName = exchange.name // TODO: Refactor all exchanges to be in the format of the stub.exchange, so we can use getName() here.
        if (exchange === undefined) {
          console.error('\nSorry, couldn\'t find an exchange named [' + exchangeName + '].')
          process.exit(1)
        }

        exchange.getBalance(s, function (err, balance) {
          if (err) throw err
          exchange.getQuote(s, function (err, quote) {
            if (err) throw err
            
            var bal = moment().format('YYYY-MM-DD HH:mm:ss').grey + ' ' + formatCurrency(quote.ask, s.currency, true, true, false) + ' ' + (s.product_id).grey + '\n'
            bal += moment().format('YYYY-MM-DD HH:mm:ss').grey + ' Asset: '.grey + balance.asset.white + ' Available: '.grey + n(balance.asset).subtract(balance.asset_hold).value().toString().yellow + '\n'
            bal += moment().format('YYYY-MM-DD HH:mm:ss').grey + ' Asset Value: '.grey + n(balance.asset).multiply(quote.ask).value().toString().white + '\n'
            bal += moment().format('YYYY-MM-DD HH:mm:ss').grey + ' Currency: '.grey + balance.currency.white + ' Available: '.grey + n(balance.currency).subtract(balance.currency_hold).value().toString().yellow + '\n'
            bal += moment().format('YYYY-MM-DD HH:mm:ss').grey + ' Total: '.grey + n(balance.asset).multiply(quote.ask).add(balance.currency).value().toString().white
            console.log(bal)
            
            if (so.calculate_currency) {
              exchange.getQuote({'product_id': s.asset + '-' + so.calculate_currency}, function (err, asset_quote) {
                if (err)  throw err

                exchange.getQuote({'product_id': s.currency + '-' + so.calculate_currency}, function (err, currency_quote) {
                  if (err)  throw err
                  var asset_total = balance.asset * asset_quote.bid
                  var currency_total = balance.currency * currency_quote.bid
                  console.log((so.calculate_currency + ': ').grey + (asset_total + currency_total))
                  process.exit()
                })
              })
            }
            else {
              process.exit()
            }
          })
        })
      }

      balance()
    })
}

