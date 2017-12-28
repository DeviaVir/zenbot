module.exports = (function (get, set, clear) {

	return {

		getTrades: () => {
	        var trades = get('db.trades')
	        get('db.mongo').collection('trades').ensureIndex({selector: 1, time: 1})

	        return trades
		},	

		getResumeMarkers: () => {
	        var resume_markers = get('db.resume_markers')
	        get('db.mongo').collection('resume_markers').ensureIndex({selector: 1, to: -1})

	        return resume_markers;
		}
	}

})

