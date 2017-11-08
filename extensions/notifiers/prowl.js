var Prowl = require('node-prowl')

module.exports = function container (get, set, clear) {
  var prowl = {
    pushMessage: function(config, title, message) {
      var p = new Prowl(config.key)
      p.push(message, title, function(err, remaining) {
        if (err) {
          console.log('error: Push message failed, ' + err)
          return
        }
      })
    }
  }
  return prowl
}
