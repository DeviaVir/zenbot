module.exports = function container (get, set) {
  return function createCollection (name, options) {
    return get('sosa_mongo')({
      db: get('mongo')
    })(name, options)
  }
}