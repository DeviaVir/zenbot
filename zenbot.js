
var semver = require('semver')
var path = require('path')
var version = require('./package.json').version
var program = require('commander')
program.version(version)
program._name = 'zenbot'

var versions = process.versions

if (semver.gt('8.3.0', versions.node)) {
  console.log('You are running a node.js version older than 8.3.x, please upgrade via https://nodejs.org/en/')
  process.exit(1)
}

var fs = require('fs')
  , boot = require('./boot')

boot(function (err, zenbot) {
  var command_name = process.argv[2]
  if (err) {
    throw err
  }
  var command_directory = './commands'
  fs.readdir(command_directory, function(err, files){
    if (err) {
      throw err
    }
    
    var commands = files.map((file)=>{
      return path.join(command_directory, file)
    }).filter((file)=>{
      return fs.statSync(file).isFile()
    })
    
    if(command_name)
      var command_found = (commands.indexOf(path.join(command_directory, command_name)+'.js') !== -1)

    if(command_found) {
      var command = require(path.resolve(__dirname, `./commands/${command_name}`))
      command(program, zenbot.conf)
    }

    if(command_name === 'new_backfill'){
      command_found = true
      command = require(path.resolve(__dirname,'./commands/backfill/backfill'))
      command(program, zenbot.conf)
    }

    if (!command_name || !command_found && (!process.argv[2] || !process.argv[2].match(/^-V|--version$/))) {
      program.help()
    }
    program.parse(process.argv)
    
  })
})
