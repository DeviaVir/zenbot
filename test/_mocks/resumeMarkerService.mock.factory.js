module.exports = function () {
	var theFactory = {} 

	/*
		By default, returns a mock resumeMarker service, which
		simply returns the trade_id it is given on each ping.

		Override opts.tradeFunction for more custom behavior.
	*/

	var count = 0;

	theFactory.get = (opts) => {

		if (opts === undefined) 
			opts = { }

		if (opts.tradeFunction === undefined)
			opts.tradeFunction = (tradeId) => {
				return tradeId;
			}

		return () => { 
			return {
				isInRange: () => { return false; },
				ping: opts.tradeFunction,
				load: (cb) => { cb() },
				flush: (cb) => { cb() }
			}
		} // resume-marker service

	}

	return theFactory
}