module.exports = function container (get, set, clear) {
  return function sensor (tick, cb) {
    tick.seen = true
    get('logger').info('sensor', tick.id)
    cb()
  }
}