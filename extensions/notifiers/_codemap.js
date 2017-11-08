module.exports = {
  _ns: 'zenbot',

  'notifiers.discord': require('./discord'),
  'notifiers.ifttt': require('./ifttt'),
  'notifiers.pushbullet': require('./pushbullet'),
  'notifiers.slack': require('./slack'),
  'notifiers.xmpp': require('./xmpp'),
  'notifiers.prowl': require('./prowl')
}
