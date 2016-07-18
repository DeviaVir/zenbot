module.exports = {
  _ns: 'motley',
  _folder: 'db',
  'logs': require('./logs'),
  'run_states': require('./run_states'),
  'ticks': require('./ticks'),
  'trades': require('./trades'),
  'collections[]': [
    '#db.logs',
    '#db.run_states',
    '#db.ticks',
    '#db.trades'
  ]
}