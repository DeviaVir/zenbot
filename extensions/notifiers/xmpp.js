var simplexmpp = require('simple-xmpp')

module.exports = function container (get, set, clear) {
  var xmpp = {
    pushMessage: function(config, title, message) {
      if (!simplexmpp.conn) {
        simplexmpp.connect({
          jid       : config.jid,
          password  : config.password,
          host      : config.host,
          port      : config.port,
          reconnect : true
        })
      }

      simplexmpp.send(config.to, title + ': ' + message)
    }
  }
  return xmpp
}