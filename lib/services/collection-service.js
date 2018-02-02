module.exports = (function (get, set, clear) {

	return {

		getTrades: () => {
	        get('db.mongo').collection('trades').ensureIndex({selector: 1, time: 1})
	        return get('db.mongo').collection('trades');
		},	

		getResumeMarkers: () => {
	        get('db.mongo').collection('resume_markers').ensureIndex({selector: 1, to: -1})
	        return get('db.mongo').collection('resume_markers');
		}
	}

})

