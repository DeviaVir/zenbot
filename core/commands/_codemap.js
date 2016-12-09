module.exports = {
  _ns: 'zenbrain',
  'commands.info': require('./info.json'),
  'commands.sim': require('./sim.json'),
  'commands.learn': require('./learn.json'),
  'commands.memory': require('./memory.json'),
  'commands.forget': require('./forget.json'),
  //'commands.sim': require('./sim.json'),
  'commands[]': [
    '#commands.info',
    '#commands.sim',
    '#commands.learn',
    '#commands.memory',
    '#commands.forget'
  ]
}