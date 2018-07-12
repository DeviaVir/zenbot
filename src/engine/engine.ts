import 'colors'
import z from 'zero-fill'

import { Core } from './core'

export default (s, conf) => {
  const core = new Core(s, conf)

  return {
    writeHeader: function() {
      process.stdout.write(
        [
          z(19, 'DATE', ' ').grey,
          z(17, 'PRICE', ' ').grey,
          z(9, 'DIFF', ' ').grey,
          z(10, 'VOL', ' ').grey,
          z(8, 'RSI', ' ').grey,
          z(32, 'ACTIONS', ' ').grey,
          z(s.options.deposit ? 38 : 25, 'BAL', ' ').grey,
          z(22, 'PROFIT', ' ').grey,
        ].join('') + '\n'
      )
    },
    update: core.onTrades,
    exit: function(cb) {
      if (core.tradeProcessingQueue.length()) {
        core.tradeProcessingQueue.drain = () => {
          if (s.strategy.onExit) {
            s.strategy.onExit.call(s.ctx, s)
          }
          cb()
        }
      } else {
        if (s.strategy.onExit) {
          s.strategy.onExit.call(s.ctx, s)
        }
        cb()
      }
    },

    executeSignal: core.executeSignal,
    writeReport: core.writeReport,
    syncBalance: core.syncBalance,
  }
}
