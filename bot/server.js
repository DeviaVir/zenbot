var constants = require('../conf/constants.json')
  , crypto = require('crypto')
  , fs = require('fs')
  , path = require('path')

module.exports = function container (get, set, clear) {
  var bot = get('bot')
  try {
    bot.secret = require('../conf/secret.json')
  }
  catch (e) {}
  if (!bot.secret) {
    bot.secret = crypto.randomBytes(8).toString('hex')
    fs.writeFileSync(path.resolve(__dirname, '..', 'conf', 'secret.json'), JSON.stringify(bot.secret, null, 2), {mode: parseInt('0600', 8)})
  }
  get('db.mems').load('learned', function (err, learned) {
    if (err) throw err
    get('hooks.runListen')(function (err) {
      if (err) throw err
      get('console').info(('[server] listening on port ' + bot.port).white)
      get('console').info(('[share url] http://localhost:' + bot.port + '/learned?secret=' + bot.secret).yellow)
    })
  })
  return null
}