var Prowl = require('node-prowl')

module.exports = function prowl (config) {
  var prowl = {
    pushMessage: function(title, message) {
      var p = new Prowl(config.key)
      p.push(message, title, function(err) {
        if (err) {
          console.log('error: Push message failed, ' + err)
          return
        }
      })
    }
  }
  return prowl
}
