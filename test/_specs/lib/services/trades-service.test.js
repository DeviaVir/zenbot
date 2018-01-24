var service = require('../../../../lib/services/trades-service')
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')()
var collectionServiceFactory = require('../../../../test/_mocks/collectionService.mock.factory')()

describe('Trades Service', function() {
	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}
	})
 
	describe('when exchange is backward, ', function() {

		var mockExchangeService = exchangeServiceFactory.get();
		var mockCollectionService = collectionServiceFactory.get();

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService
				)
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		})

		it('returns a valid opts object with default params', function() {
			var regex = new RegExp("/^stub.BTC-USD/")

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialQueryAttributes()

			expect(rtn).toBeDefined();
			expect(rtn).toEqual({id: regex})
			expect(rtn.trade_id).not.toBeDefined()
			expect(rtn.from).not.toBeDefined()
			expect(rtn.to).not.toBeDefined()			
		})

		it('returns a valid opts object when startingTradeId is given', function() {
			var regex = new RegExp("/^stub.BTC-USD/")

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialQueryAttributes(100)

			expect(rtn).toBeDefined();
			expect(rtn).toEqual({id: regex, trade_id: { $lt: 100}})
			expect(rtn.from).not.toBeDefined()
			expect(rtn.to).not.toBeDefined()
		})

	})

	describe('when exchange is forward, ', function() {

		var opts = {direction: 'forward'};
		var mockExchangeService = exchangeServiceFactory.get(opts);
		var mockCollectionService = collectionServiceFactory.get();

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService
				)
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		})

		it('returns a valid opts object with default params', function() {
			var regex = new RegExp("/^stub.BTC-USD/")

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialQueryAttributes()

			expect(rtn).toBeDefined();
			expect(rtn).toEqual({id: regex})
			expect(rtn.trade_id).not.toBeDefined()
			expect(rtn.from).not.toBeDefined()
			expect(rtn.to).not.toBeDefined()			
		})

		it('returns a valid opts object when startingTradeId is given', function() {
			var regex = new RegExp("/^stub.BTC-USD/")

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getInitialQueryAttributes(100)

			expect(rtn).toBeDefined();
			expect(rtn).toEqual({id: regex, trade_id: { $lt: 100}})
			expect(rtn.from).not.toBeDefined()
			expect(rtn.to).not.toBeDefined()
		})
	})

	describe('getTrades when DB returns nothing, and API returns two trades', function() {

		var mockExchangeService = exchangeServiceFactory.get();
		var mockCollectionService = collectionServiceFactory.get({tradesArray: [ ]});

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService
				)
		})

		it('calls getTrades correctly', function(done) {
			var instance = service(foo.get, foo.set, foo.clear)
			var normalizedSelector = mockExchangeService().getSelector().normalized;

			instance.getTrades().then((data) => {
				expect(data.length === 2).toBe(true)
				expect(data[0].id).toEqual(normalizedSelector + "-" + 3000)
				expect(data[1].id).toEqual(normalizedSelector + "-" + 3001)
				done();
			})
		})
	})

	describe('getTrades when DB returns two trades, and API returns no trades', function() {

		var mockExchangeService = exchangeServiceFactory.get({getTradesFunc: (opts, func) => { }, direction: 'forward'});
		var mockCollectionService = collectionServiceFactory.get();

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService
				)
		})

		it('calls getTrades correctly', function(done) {
			var instance = service(foo.get, foo.set, foo.clear)
			var normalizedSelector = mockExchangeService().getSelector().normalized;

			instance.getTrades().then((data) => {
				expect(data.length === 2).toBe(true)
				expect(data[0].id).toEqual(normalizedSelector + "-" + 3000)
				expect(data[1].id).toEqual(normalizedSelector + "-" + 3001)
				done();
			})
		})
	})
})