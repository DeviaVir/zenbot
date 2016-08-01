var colors = require('colors')
  , parallel = require('run-parallel-limit')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function reporter (tick, cb) {
    if (tick.size !== c.brain_speed) return cb()
    var rs = get('run_state')
    console.error('report', rs)
    cb()
  }
}