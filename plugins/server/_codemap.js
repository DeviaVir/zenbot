module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./controllers/_codemap'),
    require('./middleware/_codemap')
  ],
  'actions.server': require('./action'),
  'commands.server': require('./command.json'),
  'commands[]': '#commands.server',
  'setup.server': require('./setup'),
  'motley:hooks.close[]': function container (get, set, clear) {
    return function task (cb) {
      if (get.exists('zenbrain:sim_result')) {
        var sim_result = get('zenbrain:sim_result')
        var c = get('zenbrain:config')
        console.error('simulation result graph: http://localhost:3013/?sim_id=' + sim_result.id + '&period=6h&limit=2000&selector=' + c.default_selector)
      }
      cb()
    }
  },
  'secret': null
}