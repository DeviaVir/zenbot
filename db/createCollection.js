module.exports = function container (get, set) {
  return function createCollection (name, options) {
    return require('sosa_mongo')({
      db: get('db.mongo')
    })(name, options)
  }
}