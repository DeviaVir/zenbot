var path = require('path')

module.exports = function container (get, set, clear) {
  return function (program) {
    program
      .command('extend [dir]')
      .description('add supporting code')
      .option('-l, --list', 'list registered extensions')
      .option('-d, --delete <id>', 'unregister an extension')
      .action(function (dir, cmd) {
        var extensions = get('db.extensions')
        if (cmd.list) {
          extensions.select(function (err, results) {
            if (err) throw err
            results.forEach(function (result) {
              console.log()
              console.log(result.id)
              console.log('  path: ' + result.path)
              console.log()
            })
            process.exit(0)
          })
          return
        }
        if (cmd.delete) {
          extensions.destroy(cmd.delete, function (err) {
            if (err) throw err
            console.log('extension removed: ' + cmd.delete)
            process.exit(0)
          })
          return
        }
        var load_err
        var target = path.resolve(dir || process.cwd(), '_codemap')
        try {
          var e = require(target)
        }
        catch (er) {
          load_err = er
        }
        if (load_err || e._ns !== 'zenbot' || !e._name) {
          console.error('not a valid extension dir')
          process.exit(1)
        }
        extensions.save({id: e._name, path: target}, function (err, ext) {
          if (err) throw err
          console.log('extension added: ' + e._name)
          process.exit(0)
        })
      })
  }
}