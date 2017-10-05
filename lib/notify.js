var pb = require('pushbullet')
  , https = require('https')
  , request = require('request')

function sendIFTTT (eventName, makerKey, title, message) {
  var postData = { "value1": title , "value2": message , "value3": "TEST2" };

  function callback(error, response, body) {
    if (!error) {
        var info = JSON.parse(JSON.stringify(body));
        console.log(info);
    }
    else {
        console.log('Error happened: '+ error);
    }
  }

  var options = {
    method: 'POST',
    url: 'https://maker.ifttt.com/trigger/' + eventName + '/with/key/' + makerKey,
    json: postData
  }

  request(options, callback)
}

module.exports = function container (get, set, clear) {
  var c = get('conf')

  return {
    pushMessage: function (title, message) {
      if (c.console.on) {
        console.log(title + ': ' + message)
      }

      if (c.xmppon) {
        c.xmpp.send(c.xmppto, title + ': ' + message)
      }

      if (c.pushbullet.on) {
        c.pushbullet.pusher.note(c.pushbullet.deviceID, title, message, (err, res) => {
          if (err) {
            console.log('error: Push message failed, ' + err)
            return;
          }
          console.log('info: Push message result, ' + res)
        });
      }

      if (c.ifttt.on) {
        sendIFTTT(c.ifttt.eventName, c.ifttt.makerKey, title, message)
      }
    }
  }
}
