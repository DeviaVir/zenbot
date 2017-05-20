#!/usr/bin/env node
var version = require('./package.json').version
USER_AGENT = 'zenbot/' + version
var program = require('commander')
program.version(version)
program._name = 'zenbot'

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
  if (!command_name || !command_found) {
    program.help()
  }
  program.parse(process.argv)
})
