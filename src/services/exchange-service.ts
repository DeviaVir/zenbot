var objectifySelector = require('../util/objectify-selector')
var path = require('path')

export default (conf) => {
  // ASSUMES c.selector has been set, for example, with whatever command line parameters there may have been.
  //  Not that this class would know anything about command line parameters. It just assumes.
  var selector = objectifySelector(conf.selector)

  var theService: Record<string, any> = {}

  theService.BACKWARD = 'backward'
  theService.FORWARD = 'forward'

  function _getExchange(exchangeId?) {
    if (exchangeId === undefined) {
      exchangeId = selector.exchange_id
    }
    var rtn = undefined
    try {
      rtn = require(path.resolve(__dirname, `../plugins/exchange/${exchangeId}/exchange`))(conf)
    } catch (err) {
      // hold comment
    }

    return rtn
  }

  theService.getExchange = (exchangeId) => {
    return _getExchange(exchangeId)
  }

  theService.getSelector = () => {
    return selector
  }

  theService.isTimeSufficientlyLongAgo = (time, targetTimeInMillis) => {
    if (time === undefined) return false

    var exchange = _getExchange()
    var rtn = false

    // TODO: phase out in favor of calling exchange.getDirection()
    if (exchange.historyScan === 'backward') rtn = time < targetTimeInMillis
    else rtn = time > targetTimeInMillis

    return rtn
  }

  return theService
}
