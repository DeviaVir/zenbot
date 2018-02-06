var createCollection = require('./createCollection')
module.exports = function(conf) {
  return createCollection('balances', null, conf)
}