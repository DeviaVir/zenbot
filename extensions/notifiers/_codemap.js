module.exports = {
  _ns: 'zenbot',

  'notifiers.discord': require('./discord'),
  'notifiers.ifttt': require('./ifttt'),
  'notifiers.pushbullet': require('./pushbullet'),
  'notifiers.pushover': require('./pushover'),
  'notifiers.slack': require('./slack'),
  'notifiers.xmpp': require('./xmpp'),
  'notifiers.prowl': require('./prowl'),
  'notifiers.textbelt': require('./textbelt'),
  'notifiers.telegram': require('./telegram')
}
