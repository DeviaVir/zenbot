var request = require('request')

module.exports = function container (get, set, clear) {
  var pushover = {
    pushMessage: function(config, title, message) {
      var postData = {
        'token': config.token,
        'user': config.user,
        'tite': title,
        'message': message,
        'priority': config.priority
      }

      function callback(error) {
        if (error) {
          console.log('Error happened: '+ error)
        }
      }

      var options = {
        method: 'POST',
        url: 'https://api.pushover.net/1/messages.json',
        json: postData
      }

      request(options, callback)
    }
  }
  return pushover
}
