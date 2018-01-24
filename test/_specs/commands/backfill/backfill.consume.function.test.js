
var theFunction = require('../../../../commands/backfill/backfill.consume.function')
var tradeServiceFactory = require('../../../../test/_mocks/tradeService.mock.factory')()

describe('The Backfill Consume function', function() {
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

	describe('consumes trades from the trade service, indicates the next step should be Processing, rather than Exit', function() {
		beforeEach(function () {
			var mockTradeService = tradeServiceFactory.get({tradesArray: [{trade_id: 3001, time: 99994}, {trade_id: 3000, time: 99992}]} );

			spyOn(foo, 'get').and.returnValues(
				mockTradeService
			)

			spyOn(queue, 'enqueue').and.returnValue({ })
		})

		it('', function() {
			var callback = jasmine.createSpy('callback')
			
			var instance = theFunction(foo.get, foo.set, foo.clear)

			instance(undefined, queue, callback);

			expect(callback.calls.count()).toEqual(1) 
			expect(callback).toHaveBeenCalledWith(null, 'cp_process', 3000)
			expect(queue.enqueue).toHaveBeenCalledWith([{trade_id: 3001, time: 99994}, {trade_id: 3000, time: 99992}])
		})
	})

	describe('consumes trades from the trade service, indicates the next step should be Exit, rather than Processing', function() {
		beforeEach(function () {
			var mockTradeService = tradeServiceFactory.get({tradesArray: [ ]} );

			spyOn(foo, 'get').and.returnValues(
				mockTradeService
			)

			spyOn(queue, 'enqueue').and.returnValue({ })
		})

		it('', function() {
			var callback = jasmine.createSpy('callback')
			
			var instance = theFunction(foo.get, foo.set, foo.clear)

			instance(undefined, queue, callback);

			expect(callback.calls.count()).toEqual(1) 
			expect(callback).toHaveBeenCalledWith(null, 'cp_exit', undefined)
			expect(queue.enqueue).not.toHaveBeenCalled()
		})
	})


})