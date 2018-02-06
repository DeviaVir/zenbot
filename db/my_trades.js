var createCollection = require('./createCollection')
module.exports = function(conf) {
  return createCollection('my_trades', null, conf)
}