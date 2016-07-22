module.exports = {
  _ns: 'zenbot',
  'stategies.zmi': require('./strategy.json'),
  'strategies[]': '#strategies.zmi',
  'sensors[]': require('./sensor'),
  'thinkers[]': require('./thinker')
}