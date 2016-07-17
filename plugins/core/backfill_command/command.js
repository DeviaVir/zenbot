module.exports = function container (get, set, clear) {
  var make_command = get('utils.make_command')
  var command = require('./command.json')
  return make_command(command)
}