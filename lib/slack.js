var IncomingWebhook = require('@slack/client').IncomingWebhook;

module.exports = function container (get, set, clear) {
  return function slack (c, body) {
    var slackWebhook = new IncomingWebhook(c.slack_webhook_url || '');

    slackWebhook.send(body, function (err, header, statusCode, body) {
      if (err) {
        console.error('\nerror: slack webhook')
        console.error(err)
      } else {
        console.log('\nslack webhook statusCode = ', statusCode)
      }
    });
  }
}
