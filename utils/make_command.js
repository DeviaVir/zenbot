module.exports = function container (get, set, clear) {
  var program = get('program')
  var launcher = get('launcher')
  return function make_command (command) {
    program = program
      .command(command.spec)
      .description(command.description)
    ;(command.options || []).forEach(function (option) {
      program = program.option(option.spec, option.description, option.number ? Number : String, option.default)
    })
    var action = get('actions.' + command.action)
    program = program.action(launcher(action))
    return command
  }
}