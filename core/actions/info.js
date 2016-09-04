var colors = require('colors')
  , table = require('table').default
  , getBorderCharacters = require('table').getBorderCharacters
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var get_run_states = get('utils.get_run_states')
  var get_duration = get('utils.get_duration')
  return function () {
    var c = get('config')
    get_run_states(function (err, run_states) {
      if (err) throw err
      var run_state_table = [[
        'Selector',
        'Status',
        'Description'
      ]]
      run_states.forEach(function (run_state) {
        var status, desc
        if (new Date().getTime() - run_state.time > c.save_state_interval) {
          status = 'ONLINE'.black.bgGreen
          desc = 'Online for ' + run_state.last_duration
        }
        else {
          status = 'OFFLINE'.black.bgGrey
          desc = 'Offline for ' + get_duration(tb('µs').value - run_states.end_us)
        }
        run_state_table.push([
          run_state.exchange + '.' + run_state.asset + '-' + run_state.currency,
          status,
          desc
        ])
      })
      var opts = {
        //border: getBorderCharacters('void'),
        columnDefault: {
          paddingLeft: 0,
          paddingRight: 1
        },
        drawJoin: function () {
          return false
        }
      }
      console.error('table', run_state_table)
      var out = table(run_state_table, opts)
      console.error(out)
      get('app').close(function () {
        process.exit()
      })
    })
  }
}