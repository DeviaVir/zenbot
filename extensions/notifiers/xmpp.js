var simplexmpp = require('simple-xmpp')

module.exports = function xmpp (config) {
  var xmpp = {
    pushMessage: function(title, message) {
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