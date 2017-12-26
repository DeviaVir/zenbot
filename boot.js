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

  var authStr = '', authMechanismStr, authMechanism;
  
  if(c.mongo.username){
    authStr = encodeURIComponent(c.mongo.username)
    
    if(c.mongo.password) authStr += ':' + encodeURIComponent(c.mongo.password)

    authStr += '@'  
      
    // authMechanism could be a conf.js parameter to support more mongodb authentication methods
    authMechanism = 'DEFAULT'
  }
  
  var u = 'mongodb://' + authStr + c.mongo.host + ':' + c.mongo.port + '/' + c.mongo.db + '?' + (c.mongo.replicaSet ? '&replicaSet=' + c.mongo.replicaSet : '' ) + (authMechanism ? '&authMechanism=' + authMechanism : '' )
  require('mongodb').MongoClient.connect(u, function (err, db) {
    if (err) {
      zenbot.set('zenbot:db.mongo', null)
      console.error('WARNING: MongoDB Connection Error: ', err)
      console.error('WARNING: without MongoDB some features (such as backfilling/simulation) may be disabled.')
      console.error('Attempted authentication string: ' + u);
      return withMongo()
    }
    zenbot.set('zenbot:db.mongo', db)
    withMongo()
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