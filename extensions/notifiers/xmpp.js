var simplexmpp = require('simple-xmpp')

module.exports = function container (get, set, clear) {
  var xmpp = {
    pushMessage: function(config, title, message) {
      simplexmpp.connect({
        jid      : config.jid,
        password : config.password,
        host     : config.host,
        port     : config.port
      })

      simplexmpp.send(config.to, title + ': ' + message)

      simplexmpp.disconnect()
    }
  }
  return xmpp
}
