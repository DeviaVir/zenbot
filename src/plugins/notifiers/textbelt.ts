var request = require('request')

module.exports = function textbelt (config) {
  var textbelt = {
    pushMessage: function(title, message) {
      var postData = {'number': config.phone, 'message': title+': '+message, 'key': config.key }

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
