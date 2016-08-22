var n = require('numbro')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  return function thought_reducer (g, cb) {
    var c = get('config')
    var tick = g.tick, thoughts = g.thoughts
    thoughts.forEach(function (thought) {
      if (thought.key !== 'rsi_backfill') {
        return
      }
      //console.error('set flag', tick.id)
      tick.data.rsi_backfill = true
    })
    cb(null, g)
  }
}