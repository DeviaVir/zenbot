module.exports = {
  _ns: 'motley',
  _folder: 'bot',

  backfiller: require('./backfiller'),
  brain: require('./brain'),
  forget: require('./forget'),
  learner: require('./learner'),
  memory: require('./memory'),
  recorder: require('./recorder'),
  server: require('./server'),
  simulator: require('./simulator'),
  zen: require('./zen')
}