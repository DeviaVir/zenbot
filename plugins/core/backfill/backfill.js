var n = require('numbro')
  , tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  function backfill (options) {
    var get_products = get('utils.get_products')
    var log_trades = get('utils.log_trades')
    var rs = get('run_state')
    var c = get('constants')
    var config = get('config')
    var tasks = get('backfillers')
    

}