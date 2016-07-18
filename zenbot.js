var version = require('./package.json').version
ZENBOT_USER_AGENT = 'zenbot/' + version
var motley = require('motley')
var colors = require('colors')
var commander = require('commander')

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
            throw e
            if (e.code === 'MODULE_NOT_FOUND') {
              throw new Error('plugin ' + plugin + ' could not be found. try `npm install zenbot_' + plugin + '`')
            }
            throw e
          }
        }
        else {
          throw e
        }
      }
      return map
    }).concat(require('./_codemap'))
  },
  get_constants: function () {
    return require('./constants.json')
  },
  get_app: function () {
    var app = motley({
      _ns: 'zenbot',
      _maps: this.get_codemaps(),
      'config': this.get_config(),
      'constants': this.get_constants()
    })
    app.get('zenbot:logger').info((ZENBOT_USER_AGENT + ' booting!').cyan)
    return app
  },
  cli: function () {
    var app = this.get_app()
    app.set('zenbot:app', app)
    var launcher = app.get('zenbot:launcher')
    var program = require('commander')
      .version(version)
    app.set('zenbot:program', program)
    var command = process.argv[2]
    app.set('zenbot:command', command || null)
    var cmds = app.get('zenbot:commands').map(function (command) {
      var cmd = program
        .command(command.spec)
        .description(command.description)
      ;(command.options || []).forEach(function (option) {
        cmd = cmd.option(option.spec, option.description, option.number ? Number : String, option.default)
      })
      var action = app.get('zenbot:actions.' + command.name)
      cmd.action(launcher(action))
      return command.name
    })
    //program = app.get('zenbot:program')
    if (!command || cmds.indexOf(command) === -1) {
      program.outputHelp()
      process.exit(1)
    }
    app.mount(function (err) {
      if (err) cb(err)
      function onExit () {
        app.close(function (err) {
          process.exit()
        })
      }
      process.once('SIGINT', onExit)
      process.once('SIGTERM', onExit)
      program.parse(process.argv)
    })
  }
}