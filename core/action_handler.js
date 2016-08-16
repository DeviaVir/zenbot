var colors = require('colors')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var str_to_color = get('utils.str_to_color')
  var get_tick_str = get('utils.get_tick_str')
  var map = get('map')
  return function action_handler (tick, action, rs, cb) {
    get('logger').info('action', get_tick_str(tick.id), action.type.grey, action, {feed: 'actions'})
    if (get('command') === 'run') {
      if (action.type === 'buy' || action.type === 'sell') {
        // @todo trade api
      }
    }
    cb()
  }
}