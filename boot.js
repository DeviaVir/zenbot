var _ = require('lodash')
var minimist = require('minimist')
var version = require('./package.json').version
var EventEmitter = require('events')

module.exports = function (cb) {
  var zenbot = { version }
  var args = minimist(process.argv.slice(3))
  var conf

  if(!_.isUndefined(args.conf)){
    try {
      conf = require(args.conf)
    } catch (ee) {
      console.log('Fall back to conf.js, ' + ee)
      conf = require('./conf')
    }
  } else {
    conf = require('./conf')
  }

  var defaults = require('./conf-sample')
  _.defaultsDeep(conf, defaults)
  zenbot.conf = conf

  var eventBus = new EventEmitter()
  conf.eventBus = eventBus

  var authStr = '', authMechanism, connectionString

  if(conf.mongo.username){
    authStr = encodeURIComponent(conf.mongo.username)

    if(conf.mongo.password) authStr += ':' + encodeURIComponent(conf.mongo.password)

    authStr += '@'

    // authMechanism could be a conf.js parameter to support more mongodb authentication methods
    authMechanism = 'DEFAULT'
  }

  if (conf.mongo.connectionString) {
    connectionString = conf.mongo.connectionString
  } else {
    connectionString = 'mongodb://' + authStr + conf.mongo.host + ':' + conf.mongo.port + '/' + conf.mongo.db + '?' +
      (conf.mongo.replicaSet ? '&replicaSet=' + conf.mongo.replicaSet : '' ) +
      (authMechanism ? '&authMechanism=' + authMechanism : '' )
  }

  require('mongodb').MongoClient.connect(connectionString, function (err, client) {
    if (err) {
      console.error('WARNING: MongoDB Connection Error: ', err)
      console.error('WARNING: without MongoDB some features (such as backfilling/simulation) may be disabled.')
      console.error('Attempted authentication string: ' + connectionString)
      cb(null, zenbot)
      return
    }
    var db = client.db(conf.mongo.db)
    _.set(zenbot, 'conf.db.mongo', db)
    cb(null, zenbot)
  })
}