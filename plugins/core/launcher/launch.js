var spawn = require('child_process').spawn
  , path = require('path')

module.exports = function container (get, set, clear) {
  return function launch () {
    var args = [].slice.call(arguments)
    var options = args.pop()
    args = args.filter(function (arg) {
      return !!arg
    })
    if (args.length !== 1 || !args[0]) throw new Error('must provide one or more cmds')
    var cmds = args[0]
    var latch = 0
    cmds.forEach(function (cmd) {
      var command = get('commands.' + cmd)
      var sub_args = [cmd]
      ;(command.options || []).forEach(function (option) {
        if (typeof options[option.name] !== 'undefined') {
          sub_args.push('--' + option.name, options[option.name])
        }
      })
      ;(function respawn () {
        var proc = spawn(path.resolve(__dirname, '../../../bin/zenbot'), sub_args, {stdio: 'inherit'})
        proc.once('close', function (code) {
          if (code) {
            get('logger').info('launcher', 'cmd `' + cmd + '` exited with code ' + code + ', respawning now.')
            respawn()
          }
        })
      })()
    })
  }
}