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

		it('creates two trades with valid zenbot metadata', function(done) {
			var instance = service(foo.get, foo.set, foo.clear)
			var normalizedSelector = mockExchangeService().getSelector().normalized;

			instance.getTrades().then((data) => {
				expect(data.length === 2).toBe(true)
				expect(data[0].id).toEqual(normalizedSelector + "-" + 3000)
				expect(data[0].selector).toEqual(normalizedSelector)

				expect(data[1].id).toEqual(normalizedSelector + "-" + 3001)
				expect(data[1].selector).toEqual(normalizedSelector)
				done();
			})
		})
	})

	describe('getTrades when a tradeId is passed in, but the DB returns no results, and exchange is forward, and its history scan uses time', function() {

		var getTradesOptionsObservingFuncSpy = jasmine.createSpy('getTradesOptionsObservingFunc')
		var mockExchangeService = exchangeServiceFactory.get(
			{	historyScanUsesTime: true,
				direction: 'forward',
				getTradesOptionsObservingFunc: getTradesOptionsObservingFuncSpy,
				tradeArray: [{trade_id: 3001, time: 99994}, {trade_id: 3000, time: 99992}]
			});
		
		var mockFindOneFunction = jasmine.createSpy('mockFindOneFunction')
		var mockCollectionService = collectionServiceFactory.get(
				{	tradesArray: [ ], 
					findOneReturnTrade: {id: 'stub.BTC-USD-3000', trade_id: 3000, time: 99992 },
					mockFindOneFunction: mockFindOneFunction
				});

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService
				)
		})

		it('calls the DB to get the trade which has the time which is then passed to the exchange, and returns two valid zenbot trades', function(done) {
			var instance = service(foo.get, foo.set, foo.clear)
			var normalizedSelector = mockExchangeService().getSelector().normalized;

			instance.getTrades(3000).then((data) => {
				expect(getTradesOptionsObservingFuncSpy).toHaveBeenCalledWith({product_id: 'BTC-USD', from: 99992})
				expect(mockFindOneFunction).toHaveBeenCalledWith({id: "stub.BTC-USD-3000"});

				expect(data.length === 2).toBe(true)
				expect(data[0].id).toEqual(normalizedSelector + "-" + 3000)
				expect(data[0].selector).toEqual(normalizedSelector)

				expect(data[1].id).toEqual(normalizedSelector + "-" + 3001)
				expect(data[1].selector).toEqual(normalizedSelector)
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

		it('returns our two existing trades with valid zenbot metadata', function(done) {
			var instance = service(foo.get, foo.set, foo.clear)
			var normalizedSelector = mockExchangeService().getSelector().normalized;

			instance.getTrades().then((data) => {
				expect(data.length === 2).toBe(true)
				expect(data[0].id).toEqual(normalizedSelector + "-" + 3000)
				expect(data[0].selector).toEqual(normalizedSelector)

				expect(data[1].id).toEqual(normalizedSelector + "-" + 3001)
				expect(data[1].selector).toEqual(normalizedSelector)
				done();
			})
		})
	})
})