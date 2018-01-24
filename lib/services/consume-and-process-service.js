var events = require('events')

/**
	This service makes it easy do the the two step process of getting a bunch of resources,
	and then processing them.

	You supply a function which calls the API, calls the database, reads a file, a socket, whatever.
		When the records are retrieved, they are pushed into the supplied queue.

	You supply a function which dequeues the queue, and does something with the records. Somthing like
		calculating summary data, and/or storing them in a database.

	Both functions you supply can exit with a code that indicates they are done, at which point the 
		consume-and-process process ends.
**/

module.exports = (function (get, set, clear) {

	var theService = {} 
	var onConsumeFunc
	var onProcessFunc
	var afterOnConsumeFunc
	var afterOnProcessFunc

  	var Queue = require('../_data-structures/Queue.js');

	var _emitter = new events.EventEmitter

	theService.setOnConsumeFunc = (func) => {
		onConsumeFunc = func
	}

	theService.setOnProcessFunc = (func) => {
		onProcessFunc = func
	}

	theService.setAfterOnConsumeFunc = (func) => {
		afterOnConsumeFunc = func
	}

	theService.setAfterOnProcessFunc = (func) => {
		afterOnProcessFunc = func
	}

	theService.go = (targetTimeInMillis) => {
		var rtn = new Promise((resolve, reject) => {
  			var resumeMarkerService = get('lib.resume-marker-service')(get, set, clear)

			_emitter = new events.EventEmitter
			_queue = new Queue();
			_emitter.on('cp_consume', (record) => {
		  		onConsumeFunc(record, _queue, (err, rtnCode, mostRecentlyProcessedRecordId) => {
		  			if (rtnCode !== undefined) {
		  				if (afterOnConsumeFunc)
		  					afterOnConsumeFunc(mostRecentlyProcessedRecordId)

		  				_emitter.emit(rtnCode, mostRecentlyProcessedRecordId);
		  			}
		  		});
			})

			_emitter.on('cp_process', () => {
		  		onProcessFunc(targetTimeInMillis, _queue, resumeMarkerService.ping, (err, stopProcessingConditionReached, exitRecordId, data) => {
					if (afterOnProcessFunc)
						afterOnProcessFunc(exitRecordId, data)

					if (stopProcessingConditionReached) {
						setImmediate(() => {
							resumeMarkerService.flush(() => {
								_emitter.emit('cp_exit', exitRecordId)
							});
						})
					} else {
						setImmediate(() => {
							resumeMarkerService.flush(() => {
								_emitter.emit('cp_consume', exitRecordId)
							});
						})
					}
				})
			})

			_emitter.on('cp_exit', (mostRecentlyProcessedRecordId) => {
				resumeMarkerService.flush(() => {
					resolve(mostRecentlyProcessedRecordId)
				});
			})

			// Get things started
			resumeMarkerService.load(() => {
				_emitter.emit('cp_consume', undefined)
			});
			
		})

		return rtn;
	}

	return theService
})