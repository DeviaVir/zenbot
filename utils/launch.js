var motley = require('motley')
  , n = require('numeral')

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
      },
      'motley:conf.console{}': {
        silent: options.parent.silent
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
    var defaults = require('../conf/defaults.json')
    app.get('motley:db.mems').load('learned', function (err, learned) {
      if (err) throw err
      app.get('motley:console').info((ZENBOT_USER_AGENT + ' booting!').cyan)
      if (learned && learned.fitness_diff) {
        app.get('motley:console').info(('[zen] i have improved the strategy ' + n(learned.fitness_diff).format('0.000%') + ' over the defaults!').yellow)
      }
      if (mode !== 'simulator' && learned) {
        Object.keys(learned).forEach(function (k) {
          options[k] = learned[k]
        })
      }
      Object.keys(defaults).forEach(function (k) {
        if (typeof options[k] === 'undefined') options[k] = defaults[k]
        app.get('motley:console').info('[param]', k, '=', options[k])
      })
      app.set('motley:bot', options)
      app.set('motley:mode', mode)
      app.get('motley:bot.' + mode)
    })
    process.once('SIGINT', onExit)
    process.once('SIGTERM', onExit)
  })
}