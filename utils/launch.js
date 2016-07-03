var motley = require('motley')

module.exports = function (mode, options) {
  try {
    var config = require('../config.js')
  }
  catch (e) {
    var config = {
      mongo_uri: 'mongodb://localhost:27017/zenbot'
    }
  }
  try {
    var app = motley({
      _ns: 'motley',
      _maps: [
        require('../_codemap'),
        require('motley-mongo')
      ],
      'motley:conf.db.mongo{}': {
        url: config.mongo_uri,
        username: config.mongo_username,
        password: config.mongo_password
      }
    })
  }
  catch (err) {
    exit(err)
  }
  function exit (err) {
    console.error(err)
    console.error(err.stack)
    process.exit(1)
  }
  app.mount(function (err) {
    if (err) exit(err)
    function onExit () {
      app.close(function (err) {
        process.exit()
      })
    }
    process.once('SIGINT', onExit)
    process.once('SIGTERM', onExit)
    var defaults = require('../conf/defaults.json')
    Object.keys(defaults).forEach(function (k) {
      if (typeof options[k] === 'undefined') options[k] = defaults[k]
    })
    app.set('motley:bot', options)
    app.get('motley:bot.' + mode)
  })
}