var createCollection = require('./createCollection')
module.exports = function(conf) {
  return createCollection('resume_markers', null, conf)
}