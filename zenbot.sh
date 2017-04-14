#!/usr/bin/env node
var version = require('./package.json').version
USER_AGENT = 'zenbot/' + version
var program = require('commander')
program.version(version)
program._name = 'zenbot'

var fs = require('fs')
  , path = require('path')

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
        fs.writeFile(target, data, function (err) {
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

var command = process.argv[2]
if (!command) {
  program.outputHelp()
  process.exit(1)
}

program.parse(process.argv)
