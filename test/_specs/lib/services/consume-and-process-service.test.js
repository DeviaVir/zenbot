var service = require('../../../../lib/services/consume-and-process-service')
var resumeMarkerServiceFactory = require('../../../../test/_mocks/resumeMarkerService.mock.factory')()

describe('consume-and-process-service', function () {
	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}
	})

	describe('', function() {

		beforeEach(function () {
			var mockResumeMarkerService = resumeMarkerServiceFactory.get();

			spyOn(foo, 'get').and.returnValues(
				mockResumeMarkerService,
			)
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		})

		it('does what its supposed to', function(done) {
			var instance = service(foo.get, foo.set, foo.clear)
			var numTimesConsumeHappened = 0;
			var numTimesProcessHappended = 0;
			var MAX_CONSUME_COUNT = Math.max(1, Math.floor(Math.random() * 10));

			var consumeFunc = (record, queue, cb) => {
				//
				// imagine we get some records from somewhere.
				var arrayOfRecords = [{id: 1, val: "one"}, {id: 2, val: "two"}, {id: 3, val: "three"}]

				// then imagine we push the records on the queue
				queue.enqueue(arrayOfRecords)

				// decide what to tell our callback function				
				var exitCondition = ++numTimesConsumeHappened >= MAX_CONSUME_COUNT
				if (exitCondition)
					rtn = 'cp_exit'
				else 
					rtn = 'cp_process'

				// exit by calling the supplied callback
				cb(null, rtn, arrayOfRecords[arrayOfRecords.length - 1])
			}

			var processFunc = (targetTimeInMillis, queue, nextTradeIdFunc, cb) => {
				var arrayOfRecords = queue.dequeue();
				var exitConditionReached = false;
				var lastProcessedIndex = 0;

				// process the records somehow
				arrayOfRecords.forEach((r) => { 
					/* do something */ 
					/* set var if this record passed our targetTimeInMillis */
					/* remember the most recently processed record, so we can pass it back */
				})

				if (exitConditionReached)
					cb(null, true, arrayOfRecords[lastProcessedIndex].trade_id)
				else
					cb(null, false, arrayOfRecords[arrayOfRecords.length - 1].trade_id)
			}

			instance.setOnConsumeFunc(consumeFunc);
			instance.setOnProcessFunc(processFunc);

			var targetTimeInMillis = new Date().getTime() - 10000;

			instance.go(targetTimeInMillis).then((finalRecord) => {
				expect(finalRecord).toBeDefined();
				expect(finalRecord.id).toBe(3);
				expect(finalRecord.val).toBe("three");
				expect(numTimesConsumeHappened).toEqual(MAX_CONSUME_COUNT)
				done();
			})
		})
	})
})
