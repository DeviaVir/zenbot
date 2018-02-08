var fs = require('fs'),
  // eslint-disable-next-line no-unused-vars
  colors = require('colors')

module.exports = function (program, conf) {
  program
    .command('list-strategies')
    .description('list available strategies')
    .action(function (/*cmd*/) {
      var strategies = fs.readdirSync('./extensions/strategies')
      strategies.forEach((strategy) => {
        let strat = require(`../extensions/strategies/${strategy}/strategy`)
        console.log(strat.name.cyan + (strat.name === conf.strategy ? ' (default)'.grey : ''))
        if (strat.description) {
          console.log('  description:'.grey)
          console.log('    ' + strat.description.grey)
        }
        console.log('  options:'.grey)
        var ctx = {
          option: function (name, desc, type, def) {
            console.log(('    --' + name).green + '=<value>'.grey + '  ' + desc.grey + (typeof def !== 'undefined' ? (' (default: '.grey + def + ')'.grey) : ''))
          }
        }
        strat.getOptions.call(ctx, strat)
        console.log()
      })
      process.exit()
    })
}
