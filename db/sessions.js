var createCollection = require('./createCollection')
module.exports = function(conf) {
  return createCollection('sessions', null, conf)
}