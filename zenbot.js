var version = require('./package.json').version
ZENBOT_USER_AGENT = 'zenbot/' + version
var motley = require('motley')
var colors = require('colors')

module.exports = {
  get_config: function () {
    try {
      return require('./config')
    }
    catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        throw new Error('unable to read config.js. try `cp config-sample.js config.js`')
      }
      throw e
    }
  },
  get_codemaps: function () {
    return this.get_config().enabled_plugins.map(function (plugin) {
      var map
      try {
        map = require('zenbot_' + plugin + '/_codemap')
      }
      catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          try {
            map = require('./plugins/' + plugin + '/_codemap')
          }
          catch (e) {
            if (e.code === 'MODULE_NOT_FOUND') {
              throw new Error('plugin ' + plugin + ' could not be found. try `npm install zenbot_' + plugin + '`')
            }
            throw e
          }
        }
        throw e
      }
      return map
    }).concat(require('./_codemap'))
  },
  boot: function (cb) {
    var app = motley({
      _maps: this.get_codemaps(),
      'zenbot:config': this.get_config(),
      'zenbot:run_state': {}
    })
    var program = require('commander')
      .option('--silent', 'speak no evil')
      .version(version)
    program
      .command('*')
      .action(function () {
        program.outputHelp()
        process.exit(1)
      })
    app.set('zenbot:program', program)
    app.get('zenbot:console').info((ZENBOT_USER_AGENT + ' booting!').cyan)
    app.mount(function (err) {
      if (err) cb(err)
      function onExit () {
        app.close(function (err) {
          process.exit()
        })
      }
      process.once('SIGINT', onExit)
      process.once('SIGTERM', onExit)
      cb(null, app)
    })
  },
  cli: function () {
    this.boot(function (err, app) {
      if (err) throw err
      var program = app.get('zenbot:program')
      program.parse(process.argv)
      if (!program.rawArgs[2]) {
        program.outputHelp()
        process.exit(1)
      }
    })
  }
}