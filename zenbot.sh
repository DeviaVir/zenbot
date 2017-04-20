#!/usr/bin/env node
var version = require('./package.json').version
USER_AGENT = 'zenbot/' + version
var program = require('commander')
program.version(version)
program._name = 'zenbot'

var fs = require('fs')
  , path = require('path')
  , boot = require('./boot')

program
  .command('init')
  .description('initialize a starter config file, conf.js')
  .action(function () {
    var target = path.join(__dirname, 'conf.js')
    fs.exists(target, function (exists) {
      if (exists) {
        console.error('conf.js already exists!')
        process.exit(1)
      }
      fs.readFile(target + '.tpl', 'utf8', function (err, data) {
        if (err) throw err
        fs.writeFile(target, data, {mode: 0o600}, function (err) {
          if (err) throw err
          console.log('wrote ' + target)
          console.log('edit this file with your mongodb details if needed.')
          process.exit(0)
        })
      })
    })
  })

program
  .command('status')
  .description('monitor system status')
  .action(function () {
    boot(function (err, zenbot) {
      if (err) throw err
      process.exit(0)
    })
  })

program
  .command('extend')
  .description('add supporting code')
  .action(function () {
    boot(function (err, zenbot) {
      if (err) throw err
      var extensions = zenbot.get('zenbot:db.extensions')
      var load_err
      var target = path.join(process.cwd(), '_codemap')
      try {
        var e = require(target)
      }
      catch (er) {
        load_err = er
      }
      if (load_err || !e._name) {
        console.error('not a valid extension dir')
        process.exit(1)
      }
      extensions.save({id: target, name: e._name}, function (err, ext) {
        if (err) throw err
        console.log('extension added: ' + e._name)
        process.exit(0)
      })
    })
  })

var command = process.argv[2]
if (!command) {
  program.outputHelp()
  process.exit(1)
}

program.parse(process.argv)
