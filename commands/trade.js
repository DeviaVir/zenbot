const options = require('./trade/options')
const action = require('./trade/action')

module.exports = function(program, conf) {
  options
    .reduce(
      (program, { option, desc, type, def }) =>
        !type ? program.option(option, desc) : program.option(option, desc, type, def(conf)),
      program
        .command('trade [selector]')
        .allowUnknownOption()
        .description('run trading bot against live market data')
    )
    .action(action(conf))
}
