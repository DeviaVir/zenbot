var path = require('path')

module.exports = function container (get, set, clear) {
  return function (program) {
    program
      .command('extend')
      .description('add supporting code')
      .action(function () {
        var extensions = get('db.extensions')
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
  }
}