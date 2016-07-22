module.exports = function container (get, set, clear) {
  return function thinker (rs, cb) {
    get('logger').info('thinker', rs.id)
    cb()
  }
}