var crypto = require('crypto')

module.exports = (function (get, set, clear) {

	c = get('conf')
	
	// ASSUMES c.selector has been set, for example, with whatever command line parameters there may have been. 
	//  Not that this class would know anything about command line parameters. It just assumes.
	selector = get('lib.objectify-selector')(c.selector)

	var collectionService = get('lib.collection-service')(get, set, clear)

    // TODO: put this in a constants object
	FORWARD = 'forward'
	BACKWARD = 'backward'

	var theService = {};

	var ranges = [];
	var direction = 'backward';

	var pingCount = 0;

	theService.setDirection = (d) => {
		direction = d;
	}

	theService.getRanges = () => {
		return ranges;
	}

	function _createNewRange(obj) {
		var range = {from: obj.trade_id, to: obj.trade_id, oldest_time: obj.time, newest_time: obj.time, selector: selector.normalized};

		ranges.push(range);
		if (direction == 'backward') {
			ranges = ranges.sort((a, b) => { return b.from - a.from; })
		} else {
			ranges = ranges.sort((a, b) => { return a.to - b.to; })
		}

		range.id = crypto.randomBytes(4).toString('hex')
		range._id = range.id

		return range;
	}

	theService.createNewRange = (obj) => {
		return _createNewRange(obj);
	}

	function _isWithinRange(obj) {
		var id = obj.trade_id;

		var record = ranges.find((record) => {
			return record.from <= id && record.to >= id; 
		});

		return record;
	}

	theService.isWithinRange = (obj) => {
		return _isWithinRange(obj);
	}

	function _isWithinDistanceOfOneOfAnyRange(obj) {
		var id = obj.trade_id;

		var record = ranges.find((record) => {
			return (record.from - 1) <= id && (record.to + 1) >= id; 
		});

		return record;
	}

	theService.isWithinOneOfAnyRange = (obj) => {
		return _isWithinDistanceOfOneOfAnyRange(obj);
	}

	function _extendARange(obj) {
		var record = ranges.find((record) => {
			return (record.from - 1) <= obj.trade_id && (record.to + 1) >= obj.trade_id; 
		});

		if (record !== undefined) {
			if (direction == 'backward') {
				record.from = obj.trade_id
				record.oldest_time = obj.time

			} else {
				record.to = obj.trade_id
				record.newest_time = obj.time
			}
		}

		return record;
	}

	theService.extendARange = (obj) => {
		return _extendARange(obj);
	}

	function _merge() {
		var rtn = false; // true when we have gone through the list, and done one merge. Indicates another merge might be fruitful.

		if (ranges.length > 1) {
			var curr = 0;
			var next = 1;
			var newRanges = [];

			do {
				if (direction == 'backward') {

					if (ranges[curr].from === (ranges[next].to + 1)) {
						ranges[curr].from = ranges[next].from
						ranges[curr].oldest_time = ranges[next].oldest_time
						
						newRanges.push(ranges[curr]);

						curr += 2;
						next += 2;

						rtn = true;
					} else {
						newRanges.push(ranges[curr]);
						curr += 1;

						if (next+1 >= ranges.length)
							newRanges.push(ranges[next])

						next += 1;
					}
				} else {

					if (ranges[curr].to === (ranges[next].from - 1)) {
						ranges[curr].to = ranges[next].to
						ranges[curr].newest_time = ranges[next].newest_time
						
						newRanges.push(ranges[curr]);

						curr += 2;
						next += 2;

						rtn = true;
					} else {
						newRanges.push(ranges[curr]);
						curr += 1;

						if (next+1 >= ranges.length)
							newRanges.push(ranges[next])

						next += 1;
					}
				}
			} while (next < ranges.length)

			ranges = newRanges;
		}

		return rtn;		
	}

	theService.merge = () => {
		return _merge();
	}

	theService.ping = (obj) => {
		var theFarthestIdInRange = -1;

		rtn = _isWithinRange(obj);
		if (rtn !== undefined) {
			if (direction == 'backward')
				theFarthestIdInRange = rtn.from
			else
				theFarthestIdInRange = rtn.to

		} else{
			rtn = _isWithinDistanceOfOneOfAnyRange(obj)

			if (rtn !== undefined) {
				rtn = _extendARange(obj)
				
				while (_merge())
					rtn = ranges[0];

			} else {
				rtn = _createNewRange(obj)
			}

			if (direction == 'backward')
				theFarthestIdInRange = rtn.from
			else
				theFarthestIdInRange = rtn.to

			pingCount++;
		}

		return theFarthestIdInRange;
	}

	theService.load = (cb) => {
		collectionService.getResumeMarkers().find({selector: selector.normalized}).toArray(function (err, data) {
			ranges = data;
			
			if (cb !== undefined)
				cb();
		})
	}

	theService.flush = (cb) => {
		if (ranges.length > 0) {
			collectionService.getResumeMarkers().deleteMany({selector: selector.normalized}, function(err, data) {
				if (ranges.length > 1) {
					collectionService.getResumeMarkers().insertMany(ranges, function(err, data) { 
						if (err) throw err;

						if (cb !== undefined)
							cb();
					})
				} else {
					collectionService.getResumeMarkers().insertOne(ranges[0], function(err, data) { 
						if (err) throw err;

						if (cb !== undefined)
							cb();
					})
				}
			})
		} else {
			if (cb !== undefined)
				cb();
		}
	}

	theService.getPingCount = () => {
		return pingCount;
	}

	return theService;
})