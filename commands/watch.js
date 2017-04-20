module.exports = function container (get, set, clear) {
  return function (program) {
    program
      .command('watch')
      .description('add selectors to watch')
      .action(function () {

      })
  }
}