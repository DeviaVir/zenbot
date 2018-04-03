var IncomingWebhook = require('@slack/client').IncomingWebhook

module.exports = function slack (config) {
  var slack = {
    pushMessage: function(title, message) {
      var slackWebhook = new IncomingWebhook(config.webhook_url || '', {})
      slackWebhook.send(title + ': ' + message, function (err) {
        if (err) {
          console.error('\nerror: slack webhook')
          console.error(err)
        }
      })
    }
  }
  return slack
}
