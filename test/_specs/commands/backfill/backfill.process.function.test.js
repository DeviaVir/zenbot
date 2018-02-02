
var theFunction = require('../../../../commands/backfill/backfill.process.function')
var collectionServiceFactory =   require('../../../../test/_mocks/collectionService.mock.factory')()
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')()

describe('The Backfill Process function', function() {
	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}

		queue = {
			enqueue: function() { },
			dequeue: function() { }
		}
	})

	describe('processes trades ', function() {

		beforeEach(function () {
			var mockCollectionService = collectionServiceFactory.get();
			var mockExchangeService = exchangeServiceFactory.get();

			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService,
			)

			spyOn(queue, 'dequeue').and.returnValue([{trade_id: 3002, time: 99996}, {trade_id: 3001, time: 99994}, {trade_id: 3000, time: 99992}])
		})

		it('when all are considered new', function() {
			var callback = jasmine.createSpy('callback')
			var instance = theFunction(foo.get, foo.set, foo.clear)

			var targetTimeInMillis = 99900
			instance(targetTimeInMillis, queue, (trade) => { return trade.trade_id; }, callback)

			expect(queue.dequeue.calls.count()).toEqual(1)
			expect(callback.calls.count()).toEqual(1) 
			expect(callback).toHaveBeenCalledWith(null, false, 3000, {trade_id: 3000, time: 99992})
		})
	})

	describe('indicates exit condition was reached when one of the trades is past our time limit', function() {
		beforeEach(function () {
			var mockCollectionService = collectionServiceFactory.get();
			var mockExchangeService = exchangeServiceFactory.get();

			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService,
			)

			spyOn(queue, 'dequeue').and.returnValue([{trade_id: 3002, time: 99996}, {trade_id: 3001, time: 99994}, {trade_id: 3000, time: 99992}])
		})

		it('', function() {
			var callback = jasmine.createSpy('callback')
			var instance = theFunction(foo.get, foo.set, foo.clear)

			var targetTimeInMillis = 99993
			instance(targetTimeInMillis, queue, (trade) => { return trade.trade_id; }, callback)

			expect(queue.dequeue.calls.count()).toEqual(1)
			expect(callback.calls.count()).toEqual(1)
			expect(callback).toHaveBeenCalledWith(null, true, 3001, {trade_id: 3001, time: 99994})
		})
	})

	
	// TODO
	xdescribe('does not insert records that have already been seen', function() {
		beforeEach(function () {
			var mockCollectionService = collectionServiceFactory.get();
			var mockExchangeService = exchangeServiceFactory.get();

			spyOn(foo, 'get').and.returnValues(
				mockCollectionService,
				mockExchangeService,
			)

			spyOn(queue, 'dequeue').and.returnValue([{trade_id: 3002, time: 99996}, {trade_id: 3001, time: 99994}, {trade_id: 3000, time: 99992}])
		})

		it('', function() {
			var callback = jasmine.createSpy('callback')
			var instance = theFunction(foo.get, foo.set, foo.clear)

			var targetTimeInMillis = 99900
			instance(targetTimeInMillis, queue, callback)

			expect(queue.dequeue.calls.count()).toEqual(1)
			expect(callback.calls.count()).toEqual(1)
			expect(callback).toHaveBeenCalledWith(null, false, {trade_id: 3002, time: 99996})
			
			// TODO: How to check that theFunction only called the mockCollectionService twice? 
			//  Because there should only be two inserts when the third is reported as 'already seen'.
		})
	})

})