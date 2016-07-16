module.exports = function container (get, set, clear) {
  var program = get('program')
  var launcher = get('launcher')
  var forgetter = get('forgetter')
  return {
    name: 'forget',
    define: function () {
      program
        .command('forget <id>')
        .description('(optional) forget a run_state by id')
        .action(function (id, options) {
          launcher(forgetter, [id], options)
        })
    }
  }
}