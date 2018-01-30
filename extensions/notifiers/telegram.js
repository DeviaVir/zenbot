process.env['NTBA_FIX_319'] = 1

var TelegramBot = require('node-telegram-bot-api')

module.exports = function telegram (config) {
  var telegram = {
    pushMessage: function(title, message) {
      var bot = new TelegramBot(config.bot_token)

      bot.sendMessage(config.chat_id, title + ': ' + message).catch(function (error) {
        console.error('\nerror: telegram notification')
        console.log(error.response.body) // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
      })
    }
  }
  return telegram
}
