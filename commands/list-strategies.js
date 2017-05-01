module.exports = function container (get, set, clear) {
  return function (program) {
    program
      .command('list-strategies')
      .description('list available strategies')
      .action(function (cmd) {
        
      })
  }
}