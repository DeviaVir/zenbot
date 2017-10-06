var request = require('request')

module.exports = function container (get, set, clear) {
  var ifttt = {
    pushMessage: function(config, title, message) {
      var postData = {'value1': title , 'value2': message }

      function callback(error) {
        if (error) {
          console.log('Error happened: '+ error)
        }
      }

      var options = {
        method: 'POST',
        url: 'https://maker.ifttt.com/trigger/' + config.eventName + '/with/key/' + config.makerKey,
        json: postData
      }

      request(options, callback)
    }
  }
  return ifttt
}
