var createCollection = require('./createCollection')
module.exports = function(conf) {
  return createCollection('periods', null, conf)
}