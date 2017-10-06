module.exports = {
  _ns: 'zenbot',

  'notifiers.ifttt': require('./ifttt'),
  'notifiers.pushbullet': require('./pushbullet'),
  'notifiers.slack': require('./slack'),
  'notifiers.xmpp': require('./xmpp')
}
