
var service = require('../../../../lib/services/exchange-service')
    
describe('Exchange Service', function() {
  var normalizedSelector = 'stub.BTC-USD'
  var exchangeId = '_stub'
  describe('', function() {
    var normalizedSelector = 'stub.BTC-USD'

    it('returns undefined the expected exchange when no parameter is passed in', function() {

      var instance = service({selector: normalizedSelector})
      var rtn = instance.getExchange()

      expect(rtn).not.toBeDefined()
    })

  })

  describe('', function() {
    var selectorObject = {normalized: normalizedSelector, exchange_id: exchangeId }

    it('is available', function() {
      expect(service).not.toBe(undefined)
    }),

    it(' returns the expected exchange when no parameter is passed in', function() {
      var instance = service({selector: selectorObject})

      var rtn = instance.getExchange()

      expect(rtn).toBeDefined()
      expect(rtn.getName()).toBe('stub')
    })

    it(' returns the expected selector ', function() {
      var instance = service({selector: selectorObject})

      var rtn = instance.getSelector()

      expect(rtn).toBeDefined()
      expect(rtn.normalized).toBe(selectorObject.normalized)
      expect(rtn.exchangeId).toBe(selectorObject.exchangeId)
    })

    it(' has the correct values for backward and forward constants ', function() {
      var instance = service({selector: selectorObject})

      expect(instance.BACKWARD).toBe('backward')
      expect(instance.FORWARD).toBe('forward')
    })

  })

  describe('when direction is backward ', function () {

    it('returns true when given time is less than targetTime and exchange direction is backward ', function() {
      var instance = service({selector: {normalized: normalizedSelector, exchange_id: exchangeId }})

      expect(instance.isTimeSufficientlyLongAgo(500, 1000)).toBe(true)
    })

    it('returns false when given time is greater than targetTime and exchange direction is backward ', function() {
      var instance = service({selector: {normalized: normalizedSelector, exchange_id: exchangeId }})

      expect(instance.isTimeSufficientlyLongAgo(1000, 500)).toBe(false)
    })
  })

  describe(' when direction is forward ', function () {

    it(' returns false when given time is less than targetTime and exchange direction is forward ', function() {
      var instance = service({selector: {normalized: normalizedSelector, exchange_id: exchangeId }, historyScan: 'forward'})

      expect(instance.isTimeSufficientlyLongAgo(500, 1000)).toBe(false)
    })

    it(' returns true when given time is greater than targetTime and exchange direction is forward ', function() {
      var instance = service({selector: {normalized: normalizedSelector, exchange_id: exchangeId }, historyScan: 'forward'})

      expect(instance.isTimeSufficientlyLongAgo(1000, 500)).toBe(true)
    })
  })

})
