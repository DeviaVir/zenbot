module.exports = function (cb) {
  try {
    var c = require('./conf')
  }
  catch (e) {
    console.error('error reading conf.js! please run `zenbot init` first.')
    process.exit(1)
  }
  var zenbot = require('./')()
  zenbot.set('zenbot:conf', c)
  var u = 'mongodb://' + c.mongo_host + ':' + c.mongo_port + '/' + c.mongo_db
  zenbot.get('zenbot:mongodb').MongoClient.connect(u, function (err, db) {
    if (err) return cb(err)
    zenbot.set('zenbot:mongo', db)
    if (c.mongo_username) {
      db.authenticate(c.mongo_username, c.mongo_password, function (err, result) {
        if (err) return cb(err)
        cb(null, zenbot)
      })
    }
    else {
      cb(null, zenbot)
    }
  })
}