var pusher = require('pushbullet')

module.exports = function container (get, set, clear) {
  var pushbullet = {
    pushMessage: function(config, title, message) {
      var pb = new pusher(config.key)
      pb.note(config.deviceID, title, message, (err) => {
        if (err) {
          console.log('error: Push message failed, ' + err)
          return
        }
      })
    }
  }
  return pushbullet
}
