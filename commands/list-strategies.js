module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('list-strategies')
      .description('list available strategies')
      .action(function (cmd) {
        console.log()
        get('strategies.list').forEach(function (s) {
          console.log(s.name.cyan + (s.name === c.strategy ? ' (default)'.grey : ''))
          if (s.description) {
            console.log('  description:'.grey)
            console.log('    ' + s.description.grey)
          }
          console.log('  options:'.grey)
          var ctx = {
            option: function (name, desc, type, def) {
              console.log(('    --' + name).green + '=<value>'.grey + '  ' + desc.grey + (typeof def !== 'undefined' ? (' (default: '.grey + def + ')'.grey) : ''))
            }
          }
          s.getOptions.call(ctx, s)
          console.log()
        })
        process.exit()
      })
  }
}