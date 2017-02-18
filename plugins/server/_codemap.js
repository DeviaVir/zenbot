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
      /*Get Network IP for Sim results*/ 
      var os = require('os');
      var ifaces = os.networkInterfaces();
      var values = Object.keys(ifaces).map(function(name) {
        return ifaces[name];
      });
      values = [].concat.apply([], values).filter(function(val){ 
        return val.family === 'IPv4' && val.internal === false; 
      });
      var ip = values.length ? values[0].address : '127.0.0.1';
      if (get.exists('zenbrain:sim_result')) {
        var sim_result = get('zenbrain:sim_result')
        var c = get('zenbrain:config')
         console.error('simulation result graph: http://' + ip + ':3013/?sim_id=' + sim_result.id + '&period=6h&limit=2000&selector=' + c.default_selector)
      }
      cb()
    }
  },
  'secret': null
}
