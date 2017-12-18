var glob = require('glob')
  , path = require('path')

module.exports = function (cb) {
  var zenbot = require('./')()
  var c = getConfiguration()

  var defaults = require('./conf-sample')
  Object.keys(defaults).forEach(function (k) {
    if (typeof c[k] === 'undefined') {
      c[k] = defaults[k]
    }
  })
  zenbot.set('@zenbot:conf', c)

  function withMongo () {
    //searches all directorys in {workingdir}/extensions/ for files called '_codemap.js'
    glob('extensions/**/_codemap.js', {cwd: __dirname, absolute: true}, function (err, results) {
      if (err) return cb(err)
      results.forEach(function (result) {
        var ext = require(result) //load the _codemap for the extension
        zenbot.use(ext)           //load the extension into zenbot
      })
      cb(null, zenbot)
    })
  }

  var u = 'mongodb://' + c.mongo.host + ':' + c.mongo.port + '/' + c.mongo.db + (c.mongo.replicaSet ? '?replicaSet=' + c.mongo.replicaSet : '')
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

  function getConfiguration() {
    var conf = undefined

    try {
      var _allArgs = process.argv.slice();
      var found = false

      while (!found && _allArgs.length > 0) {
        found = (_allArgs.shift() == '--conf');
      }

      if (found) {
        try {
          conf = require(_allArgs[0])
        } catch (ee) {
          conf = require('./conf')
        }
      } else {
        conf = require('./conf')
      }
    }
    catch (e) {
      conf = {}
    }

    return conf
  }
}