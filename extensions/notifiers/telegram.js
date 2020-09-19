process.env['NTBA_FIX_319'] = 1

var TelegramBot = require('node-telegram-bot-api')

module.exports = function telegram (config) {
  var bot = new TelegramBot(config.bot_token, { polling: true })
  var wrapper = function(cb) {
    return function(message) {
      if (message.chat.id != config.chat_id) {
        console.log('\nChat ID error: command coming from wrong chat: ' + message.chat.id)
        return
      }
      cb(message.text)
    }
  }
  var telegram = {
    pushMessage: function(title, message) {
      bot.sendMessage(config.chat_id, title + ': ' + message).catch(function (error) {
        console.error('\nerror: telegram notification')
        console.log(error.response.body) // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
      })
    },
    onMessage: function (callback) {
      bot.on('message', wrapper(callback))
      bot.on('webhook_error', (error) => {
        console.log('\nwebhook error: telegram event ' + error.code)
      })
      bot.on('polling_error', (error) => {
        console.log('\npolling error: telegram event ' + error.code)
      })
      bot.on('error', (error) => {
        console.log('\nerror: telegram event ' + error.code)
      })
    }
  }
  return telegram
}
