module.exports = function container (get, set, clear) {
  return function (program) {
    program
      .command('watcher')
      .description('creates a long-running process to record trade data')
      .action(function () {

      })
  }
}