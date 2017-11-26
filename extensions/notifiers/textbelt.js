var request = require('request')

module.exports = function container (get, set, clear) {
  var textbelt = {
    pushMessage: function(config, title, message) {
      var postData = {'number': config.phone, 'message': title+": "+message, 'key': config.key }

      function callback(error) {
        if (error) {
          console.log('Error happened: '+ error)
        }
      }

      var options = {
        method: 'POST',
        url: 'https://textbelt.com/text',
        json: postData
      }

      request(options, callback)
    }
  }
  return textbelt
}
