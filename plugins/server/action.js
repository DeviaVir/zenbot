var z = require('zero-fill')
module.exports = function container (get, set, clear) {
  var get_id = get('zenbrain:utils.get_id')
  return function action () {
    var c = get('zenbrain:config')
    var app = get('app')
    var secret = get_id()
    set('@zenbrain:secret', secret)
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
    app.listen(function (err) {
      if (err) throw err
      get('logger').info('server', USER_AGENT, 'booted!'.cyan)
      var port = get('motley:site.server').address().port
      get('logger').info('server', 'open'.grey, ('http://' + ip + ':' + port + '/?secret=' + secret).yellow, 'to see a live graph.'.grey)
    })
  }
}
