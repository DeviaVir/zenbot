module.exports = {
  _ns: 'zenbot',
  'backfiller': require('./backfiller.json'),
  'commands.backfill': require('./backfiller_command'),
  'motley:hooks.boot[]': function container (get, set) {
    var program = get('program')
    return function task (cb) {
      get('commands.backfill')(program)
      cb()
    }
  }
}