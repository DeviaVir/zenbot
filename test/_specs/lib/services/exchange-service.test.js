
var service = require('../../../../lib/services/exchange-service')
	
describe('Exchange Service', function() {
	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}
	})

	describe('', function() {
		normalizedSelector = 'stub.BTC-USD'
		exchangeId = 'stub'
		selectorObject = {normalized: normalizedSelector, exchange_id: exchangeId };

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				{selector: normalizedSelector}, // conf
				
				() => { return selectorObject } // selector object
				);
		})

		it('returns undefined the expected exchange when no parameter is passed in', function() {

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getExchange()

			expect(rtn).not.toBeDefined();
		})

	})

	describe('', function() {
		normalizedSelector = 'stub.BTC-USD'
		exchangeId = 'stub'
		selectorObject = {normalized: normalizedSelector, exchange_id: exchangeId };

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				{selector: normalizedSelector}, // conf
				
				() => { return selectorObject }, // selector object
				
				{
					getName: () => { return exchangeId; }
				} // the exchange object

				);
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		}),

		it(' returns the expected exchange when no parameter is passed in', function() {

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getExchange()

			expect(rtn).toBeDefined();
			expect(rtn.getName()).toBe('stub');
		})

		it(' returns the expected selector ', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getSelector();

			expect(rtn).toBeDefined();
			expect(rtn.normalized).toBe(selectorObject.normalized);
			expect(rtn.exchangeId).toBe(selectorObject.exchangeId);
		})

		it(' has the correct values for backward and forward constants ', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			expect(instance.BACKWARD).toBe('backward')
			expect(instance.FORWARD).toBe('forward')
		})

	})

	describe(' when direction is backward ', function () {
		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				{selector: normalizedSelector}, // conf
				
				() => { return selectorObject }, // selector object
				
				{
					getName: () => { return exchangeId; },
					historyScan: 'backward' // TODO: Replace this with exchange.getDirection()

				} // the exchange object

				);
		})

		it(' returns true when given time is less than targetTime and exchange direction is backward ', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			expect(instance.isTimeSufficientlyLongAgo(500, 1000)).toBe(true);
		})

		it(' returns false when given time is greater than targetTime and exchange direction is backward ', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			expect(instance.isTimeSufficientlyLongAgo(1000, 500)).toBe(false);
		})
	})

	describe(' when direction is forward ', function () {
		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				{selector: normalizedSelector}, // conf
				
				() => { return selectorObject }, // selector object
				
				{
					getName: () => { return exchangeId; },
					historyScan: 'forward' // TODO: Replace this with exchange.getDirection()

				} // the exchange object

				);
		})

		it(' returns false when given time is less than targetTime and exchange direction is forward ', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			expect(instance.isTimeSufficientlyLongAgo(500, 1000)).toBe(false);
		})

		it(' returns true when given time is greater than targetTime and exchange direction is forward ', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			expect(instance.isTimeSufficientlyLongAgo(1000, 500)).toBe(true);
		})
	})

});
