module.exports = function container (get, set, clear) {
  return function thinker (tick, cb) {
    var rs = get('run_state')
    console.error('think', tick)
    cb()
  }
}