var n = require('numbro')
  , colors = require('colors')
  , z = require('zero-fill')

module.exports = function container (get, set, clear) {
  var first_report = true
  var c = get('constants')
  return function thinker (rs, cb) {
    get('logger').info('thinker', rs.id)
    if (first_report) {
      var ts = is_sim ? '             SIM DATE      ' : ''
      console.error(('DATE                       PRODUCT GRAPH                  PRICE     ZMI' + ts + '             ' + c.asset + '      ' + c.currency + '        BALANCE    DIFF       TRADED').white)
      first_report = false
    }
    var bar = getGraph()
    rs.net_worth = n(rs.currency)
      .add(n(rs.asset).multiply(rs.last_tick.close))
      .value()
    var diff = n(rs.net_worth).subtract(rs.start_balance)
      .value()
    if (diff > 0) diff = z(9, '+' + n(diff).format('$0.00'), ' ').green
    if (diff === 0) diff = z(9, n(diff).format('$0.00'), ' ').white
    if (diff < 0) diff = (z(9, n(diff).format('$0.00'), ' ')).red
    var zmi = colors.strip(rs.zmi_vol_diff_string).trim()
    var status = [
      c.asset.grey,
      c.currency.grey,
      bar,
      rs.arrow + z(9, n(rs.last_tick.close).format('$0.00'), ' ')[rs.uptick ? 'green' : 'red'],
      rs.zmi_vol_diff_string,
      is_sim ? rs.last_tick.timestamp.grey : false,
      z(7, n(rs.asset).format('0.000'), ' ').white,
      z(9, n(rs.currency).format('$0.00'), ' ').yellow,
      z(9, n(rs.net_worth).format('$0.00'), ' ').cyan,
      diff,
      z(7, n(rs.trade_vol).format('0.000'), ' ').white
    ].filter(function (col) { return col === false ? false : true }).join(' ')
    get('logger').info('status', status, {data: {rs: rs, zmi: zmi, new_max_vol: rs.zmi_new_max_vol, side: rs.side, price: rs.last_tick.price}})
    var status_public = [
      c.asset.grey,
      c.currency.grey,
      bar,
      rs.arrow + z(8, n(rs.last_tick.close).format('$0.00'), ' ')[rs.uptick ? 'green' : 'red'],
      rs.zmi_vol_diff_string
    ].join(' ')
    get('logger').info('status', status_public, {public: true, data: {zmi: zmi, new_max_vol: rs.zmi_new_max_vol, side: rs.side, price: rs.last_tick.price}})
    cb()
  }
}