var _ = require('lodash')
var path = require('path')
var minimist = require('minimist')
var version = require('./package.json').version
var EventEmitter = require('events')

module.exports = function (cb) {
  var zenbot = { version }
  var args = minimist(process.argv.slice(3))
  var conf = {}
  var config

  // 1. load conf overrides file if present
  if(!_.isUndefined(args.conf)){
    try {
      conf = require(path.resolve(process.cwd(), args.conf))
    } catch (err) {
      console.error(err + ', failed to load conf overrides file!')
    }
  }

  // 2. load conf.js if present
  try {
    config = require('./conf')
  } catch (err) {
    console.error(err + ', falling back to conf-sample')
  }

  // 3. Load conf-sample.js and merge
  var defaults = require('./conf-sample')
  _.defaultsDeep(conf, config, defaults)
  zenbot.conf = _.cloneDeep(conf)

  var eventBus = new EventEmitter()
  zenbot.conf.eventBus = eventBus

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