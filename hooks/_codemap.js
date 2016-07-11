module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'hooks',

  'ensure_indexes': require('./ensure_indexes'),
  'register_helpers': require('./register_helpers'),
  'boot[]': [
    '#hooks.register_helpers'
  ],
  'mount[]': [
    '#hooks.ensure_indexes'
  ]
}