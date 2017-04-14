module.exports = function (cb) {
  try {
    var conf = require('./conf')
  }
  catch (e) {
    console.error('error reading conf.js! please run `zenbot init` first.')
    return cb(new Error('conf error'))
  }
  var zenbot = require('./')()
  zenbot.set('zenbot:conf', conf)
  var u = 'mongodb://' + conf.mongo_host + ':' + conf.mongo_port + '/' + conf.mongo_db
  zenbot.get('zenbot:core.mongodb').MongoClient.connect(u, function (err, db) {
    if (err) return cb(err)
    zenbot.set('zenbot:core.mongo', db)
    if (conf.mongo_username) {
      db.authenticate(conf.mongo_username, conf.mongo_password, function (err, result) {
        if (err) return cb(err)
        cb(null, zenbot)
      })
    }
    else {
      cb(null, zenbot)
    }
  })
}