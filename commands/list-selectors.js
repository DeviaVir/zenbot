var path = require('path')
var parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  return function (program) {
    program
      .command('list-selectors')
      .alias('ls')
      .description('list available selectors to watch')
      .action(function (cmd) {
        get('db.selectors').select(function (err, watching) {
          if (err) throw err
          var watch_list = watching.map(function (watched_selector) {
            return watched_selector.id
          })
          get('lib.list-selectors')(function (err, selectors) {
            if (err) throw err
            console.log()
            selectors.forEach(function (selector) {
              console.log('  ' + selector + (watch_list.indexOf(selector) !== -1 ? ' (watching)' : ''))
            })
            console.log()
            process.exit(0)
          })
        })
      })
  }
}