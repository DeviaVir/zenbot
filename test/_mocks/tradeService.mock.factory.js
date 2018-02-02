module.exports = function () {
	var theFactory = {} 

	/*
		By default, returns a mock trade service, which
		returns no trades.

		Set opts.tradesArray to return trades. Y'know, in a mock, or something.
	*/

	theFactory.get = (opts) => {

		if (opts === undefined) 
			opts = { }

		if (opts.tradesArray === undefined)
			opts.tradesArray = []; 

		return () => { 
			return {
				getInitialOptsObject: () => { },
				getTrades: (tradeSearchOpts) => { return { 
					then: (cb) => { cb( opts.tradesArray ); } }}
			} // trade service
		}
	}

	return theFactory
}