module.exports = {
  _ns: 'motley',
  _folder: 'hooks',
  'mount[]': [
    '#hooks.ensure_indexes'
  ],
  'ensure_indexes': require('./ensure_indexes')
}