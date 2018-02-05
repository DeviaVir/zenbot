
var theFunction = require('../../../../commands/backfill/backfill.function')
var consumeAndProcessServiceFactory = require('../../../../test/_mocks/consumeAndProcessService.mock.factory')()

describe('The Backfill function', function() {
	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}

		var mockConsumeAndProcessService = consumeAndProcessServiceFactory.get();

		spyOn(foo, 'get').and.returnValues(
			mockConsumeAndProcessService,
			() => { },
			() => { },
			() => { }
		)

		// DEBUGGING 
		process.on('unhandledRejection', (reason, p) => {
		  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
		  // application specific logging, throwing an error, or other logic here
		});
		
	})

	it('uses consumeAndProcessService to get the expected value', function() {
		var instance = theFunction(foo.get, foo.set, foo.clear);

		instance(10000).then((finalTrade) => {
			expect(finalTrade).toEqual({trade_id: 3001}) // this is the last trade defined by default to be returned from the mock consume and process service.
		})
	})
})
