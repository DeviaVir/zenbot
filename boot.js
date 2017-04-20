module.exports = function (cb) {
  var zenbot = require('./')()
  try {
    var c = require('./conf')
  }
  catch (e) {
    var err = new Error('conf error')
    err.code = 'CONF'
    return cb(err, zenbot)
  }
  zenbot.set('@zenbot:conf', c)
  var u = 'mongodb://' + c.mongo_host + ':' + c.mongo_port + '/' + c.mongo_db
  require('mongodb').MongoClient.connect(u, function (err, db) {
    if (err) {
      err.code = 'CONNECT'
      return cb(err, zenbot)
    }
    zenbot.set('zenbot:db.mongo', db)
    if (c.mongo_username) {
      db.authenticate(c.mongo_username, c.mongo_password, function (err, result) {
        if (err) {
          err.code = 'AUTH'
          return cb(err, zenbot)
        }
        cb(null, zenbot)
      })
    }
    else {
      cb(null, zenbot)
    }
  })
}