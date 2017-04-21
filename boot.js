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
  var defaults = require('./defaults')
  Object.keys(defaults).forEach(function (k) {
    if (typeof c[k] === 'undefined') {
      c[k] = defaults[k]
    }
  })
  zenbot.set('@zenbot:conf', c)
  var u = 'mongodb://' + c.mongo_host + ':' + c.mongo_port + '/' + c.mongo_db
  require('mongodb').MongoClient.connect(u, function (err, db) {
    if (err) {
      err.code = 'CONNECT'
      return cb(err, zenbot)
    }
    zenbot.set('zenbot:db.mongo', db)
    function withAuth () {
      var extensions = zenbot.get('zenbot:db.extensions')
      extensions.select(function (err, results) {
        if (err) {
          return cb(err, zenbot)
        }
        results.forEach(function (result) {
          var ext = require(result.path)
          zenbot.use(ext)
        })
        cb(null, zenbot)
      })
    }
    if (c.mongo_username) {
      db.authenticate(c.mongo_username, c.mongo_password, function (err, result) {
        if (err) {
          err.code = 'AUTH'
          return cb(err, zenbot)
        }
        withAuth()
      })
    }
    else {
      withAuth()
    }
  })
}