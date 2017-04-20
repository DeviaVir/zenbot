var path = require('path')
  , fs = require('fs')

module.exports = function container (get, set, clear) {
  return function (program) {
    if (get('conf')) {
      return
    }
    program
      .command('init')
      .description('initialize a starter config file, conf.js')
      .action(function () {
        var target = path.join(__dirname, '..', 'conf.js')
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
  }
}