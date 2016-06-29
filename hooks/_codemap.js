module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'hooks',

  'ensureIndexes': require('./ensureIndexes'),
  'mountBackfiller': require('./mountBackfiller'),
  'mountBot': require('./mountBot'),
  'mountRecorder': require('./mountRecorder')
}