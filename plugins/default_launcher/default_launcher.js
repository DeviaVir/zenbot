module.exports = function container (get, set, clear) {
  return function launcher (func, args, options) {
    var command = get('command')
    get('motley:db.run_states').load(command, function (err, run_state) {
      if (err) throw err
      set('run_state', run_state || {id: command})
      func.apply(null, args.concat(options))
    })
  }
}