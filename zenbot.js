
var semver = require('semver')
var version = require('./package.json').version
USER_AGENT = 'zenbot/' + version
var program = require('commander')
program.version(version)
program._name = 'zenbot'

var versions = process.versions

if (semver.gt('6.0.0', versions.node)) {
  console.log('You are running a node.js version older than 6.x, please upgrade via https://nodejs.org/en/')
  process.exit(1)
}

var fs = require('fs')
  , path = require('path')
  , boot = require('./boot')

boot(function (err, zenbot) {
  var command_name = process.argv[2]
  if (err) {
    throw err
  }
  var commands = zenbot.get('zenbot:commands.list')
  commands.forEach(function (command) {
    command(program)
  })
  var command_found = false
  try {
    zenbot.get('zenbot:commands.' + command_name)
    command_found = true
  }
  catch (e) {
  }
  if (!command_name || !command_found && (!process.argv[2] || !process.argv[2].match(/^-V|--version$/))) {
    program.help()
  }
  program.parse(process.argv)
})
