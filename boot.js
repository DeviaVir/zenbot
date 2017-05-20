var glob = require('glob')
  , path = require('path')

module.exports = function (cb) {
  var zenbot = require('./')()
  try {
    var c = require('./conf')
  }
  catch (e) {
    c = {}
  }
  var defaults = require('./conf-sample')
  Object.keys(defaults).forEach(function (k) {
    if (typeof c[k] === 'undefined') {
      c[k] = defaults[k]
    }
  })
  zenbot.set('@zenbot:conf', c)

  function withMongo () {
    glob('extensions/*', {cwd: __dirname, absolute: true}, function (err, results) {
      if (err) return cb(err)
      results.forEach(function (result) {
        if (path.basename(result) === 'README.md') {
          return
        }
        var ext = require(path.join(result, '_codemap'))
        zenbot.use(ext)
      })
      cb(null, zenbot)
    })
  }

  var u = 'mongodb://' + c.mongo.host + ':' + c.mongo.port + '/' + c.mongo.db
  require('mongodb').MongoClient.connect(u, function (err, db) {
    if (err) {
      zenbot.set('zenbot:db.mongo', null)
      console.error('warning: mongodb not accessible. some features (such as backfilling/simulation) may be disabled.')
      return withMongo()
    }
    zenbot.set('zenbot:db.mongo', db)
    if (c.mongo.username) {
      db.authenticate(c.mongo.username, c.mongo.password, function (err, result) {
        if (err) {
          zenbot.set('zenbot:db.mongo', null)
          console.error('warning: mongodb auth failed. some features (such as backfilling/simulation) may be disabled.')
        }
        withMongo()
      })
    }
    else {
      withMongo()
    }
  })
}