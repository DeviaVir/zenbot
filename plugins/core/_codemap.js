module.exports = {
  _ns: 'zenbot',
  _maps: [
    require('./backfill_command/_codemap'),
    require('./brain/_codemap'),
    require('./export_command/_codemap'),
    require('./forget_command/_codemap'),
    require('./launcher/_codemap'),
    require('./learn_command/_codemap'),
    require('./logger/_codemap'),
    require('./mapreduce_command/_codemap'),
    require('./mongo_store/_codemap'),
    require('./record_command/_codemap'),
    require('./run_command/_codemap'),
    require('./sim_command/_codemap'),
    require('./status_command/_codemap'),
    require('./tick_reporter/_codemap'),
    require('./twitter_client/_codemap')
  ]
}