module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./controllers/_codemap'),
    require('./middleware/_codemap')
  ],
  'actions.server': require('./action'),
  'commands.server': require('./command.json'),
  'commands[]': '#commands.server',
  'setup.server': require('./setup')
}