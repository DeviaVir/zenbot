module.exports = function container (get, set, clear) {
  return function (program) {
    program
      .command('watch <selector>')
      .description('add selectors to watch')
      .option('-d, --delete', 'stop watching the selector')
      .action(function (selector, cmd) {
        selector = get('lib.normalize-selector')(selector)
        if (cmd.delete) {
          get('db.selectors').destroy(selector, function (err) {
            if (err) throw err
            console.log('selector removed: ' + selector)
            process.exit(0)
          })
          return
        }
        get('lib.list-selectors')(function (err, selectors) {
          if (err) throw err
          if (selectors.indexOf(selector) === -1) {
            console.error('invalid selector: ' + selector)
            process.exit(1)
          }
          get('db.selectors').save({id: selector}, function (err) {
            if (err) throw err
            console.log('selector added: ' + selector)
            process.exit(0)
          })
        })
      })
  }
}