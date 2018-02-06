var sosa_mongo = require('sosa_mongo')

module.exports = function createCollection (name, options, conf) {
  return sosa_mongo({ db: conf.db.mongo })(name, options)
}
