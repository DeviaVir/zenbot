module.exports = {
  _ns: 'zenbot',
  _name: 'gemini',

  'exchanges.gemini': require('./exchange'),
  'exchanges.list[]': '#exchanges.gemini'
}
