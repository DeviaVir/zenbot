var createCollection = require('./createCollection')
module.exports = function(conf){
  return createCollection('trades', null, conf)
}