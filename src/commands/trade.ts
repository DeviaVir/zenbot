import options from '../trader/options'
import { Trader } from '../trader/trader'

export default (program, conf) => {
  options
    .reduce((program, { option, desc, type, def }) => {
      return !type ? program.option(option, desc) : program.option(option, desc, type, def(conf))
    }, program.command('trade [selector]').allowUnknownOption())
    .action((selector, cmd) => {
      const trader = new Trader(selector, process.argv, cmd, conf)
      trader.init()
    })
}
