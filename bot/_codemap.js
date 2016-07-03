module.exports = {
  _ns: 'motley',
  _folder: 'bot',

  backfiller: require('./backfiller'),
  brain: require('./brain'),
  forget: require('./forget'),
  learner: require('./learner'),
  recorder: require('./recorder'),
  simulator: require('./simulator'),
  zen: require('./zen')
}