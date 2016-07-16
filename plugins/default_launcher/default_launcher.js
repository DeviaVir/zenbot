var n = require('numbro')

module.exports = function container (get, set, clear) {
  return function launcher (func, args, options) {
    var command = get('command')
    get('motley:db.run_states').load(command, function (err, run_state) {
      if (err) throw err
      run_state || (run_state = {id: command, time: new Date().getTime()})
      set('run_state', run_state)
      Object.keys(run_state).forEach(function (k) {
        var val = run_state[k]
        if (typeof val === 'number') {
          val = n(val).format('0.000').white
        }
        else if (typeof val === 'string') {
          val = ('"' + val + '"').green
        }
        get('logger').info(('[run_state] '.yellow + (k + ' =').grey), val, {public: false})
      })
      
      
      func.apply(null, args.concat(options))
    })
  }
}