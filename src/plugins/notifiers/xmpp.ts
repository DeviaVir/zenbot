import simplexmpp from 'simple-xmpp'

export const xmpp = (config) => {
  var xmpp = {
    pushMessage: function(title, message) {
      if (!simplexmpp.conn) {
        simplexmpp.connect({
          jid: config.jid,
          password: config.password,
          host: config.host,
          port: config.port,
          reconnect: true,
        })
      }

      simplexmpp.send(config.to, title + ': ' + message)
    },
  }
  return xmpp
}
