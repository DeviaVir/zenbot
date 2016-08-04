module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./controllers/_codemap')
  ],
  'actions.ticker_server': require('./action'),
  'commands.ticker_server': require('./command.json'),
  'commands[]': '#commands.ticker_server',
  'setup.ticker_server': require('./setup')
}