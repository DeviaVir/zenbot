var mock = require('mock-require')
var service = require('../../../../lib/services/trades-service')
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')
var collectionServiceFactory = require('../../../../test/_mocks/collectionService.mock.factory')

describe('Trades Service', function() {
  beforeEach(function() {
    mock('../../../../lib/services/exchange-service', exchangeServiceFactory)
    mock('../../../../lib/services/collection-service', collectionServiceFactory)
    service = mock.reRequire('../../../../lib/services/trades-service')

  })
  afterEach(function() {
    mock.stopAll()
  })
 
  describe('when exchange is backward, ', function() {

    it('is available', function() {
      expect(service).not.toBe(undefined)
    })

    it('returns a valid opts object with default params', function() {
      var regex = new RegExp('/^stub.BTC-USD/')

      var instance = service({})

      var rtn = instance.getInitialQueryAttributes()

      expect(rtn).toBeDefined()
      expect(rtn).toEqual({id: regex})
      expect(rtn.trade_id).not.toBeDefined()
      expect(rtn.from).not.toBeDefined()
      expect(rtn.to).not.toBeDefined()			
    })

    it('returns a valid opts object when startingTradeId is given', function() {
      var regex = new RegExp('/^stub.BTC-USD/')

      var instance = service({direction:'backward'})

      var rtn = instance.getInitialQueryAttributes(100)

      expect(rtn).toBeDefined()
      expect(rtn).toEqual({id: regex, trade_id: { $lt: 100}})
      expect(rtn.from).not.toBeDefined()
      expect(rtn.to).not.toBeDefined()
    })

  })

  describe('when exchange is forward, ', function() {
    it('is available', function() {
      expect(service).not.toBe(undefined)
    })

    it('returns a valid opts object with default params', function() {
      var regex = new RegExp('/^stub.BTC-USD/')

      var instance = service({direction:'forward'})

      var rtn = instance.getInitialQueryAttributes()

      expect(rtn).toBeDefined()
      expect(rtn).toEqual({id: regex})
      expect(rtn.trade_id).not.toBeDefined()
      expect(rtn.from).not.toBeDefined()
      expect(rtn.to).not.toBeDefined()			
    })

    it('returns a valid opts object when startingTradeId is given', function() {
      var regex = new RegExp('/^stub.BTC-USD/')

      var instance = service({direction:'forward'})

      var rtn = instance.getInitialQueryAttributes(100)

      expect(rtn).toBeDefined()
      expect(rtn).toEqual({id: regex, trade_id: { $lt: 100}})
      expect(rtn.from).not.toBeDefined()
      expect(rtn.to).not.toBeDefined()
    })
  })

  describe('getTrades when DB returns nothing, and API returns two trades', function() {

    it('calls getTrades correctly', function(done) {
      var instance = service({tradesArray: [ ]})
      var normalizedSelector = exchangeServiceFactory({}).getSelector().normalized

      instance.getTrades().then((data) => {
        expect(data.length === 2).toBe(true)
        expect(data[0].id).toEqual(normalizedSelector + '-' + 3000)
        expect(data[1].id).toEqual(normalizedSelector + '-' + 3001)
        done()
      })
    })
  })

  describe('getTrades when DB returns two trades, and API returns no trades', function() {

    it('calls getTrades correctly', function(done) {
      var instance = service({getTradesFunc: (opts, func) => { }, direction: 'forward'})
      var normalizedSelector = exchangeServiceFactory({}).getSelector().normalized

      instance.getTrades().then((data) => {
        expect(data.length === 2).toBe(true)
        expect(data[0].id).toEqual(normalizedSelector + '-' + 3000)
        expect(data[1].id).toEqual(normalizedSelector + '-' + 3001)
        done()
      })
    })
  })
})