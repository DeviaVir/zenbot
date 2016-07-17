module.exports = function container (get, set, clear) {
  var command = get('commands.export')
  var rs = get('run_state')
  function export_ticks () {

  }
  return export_ticks
}