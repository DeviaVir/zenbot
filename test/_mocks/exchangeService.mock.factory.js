module.exports = function () {
	var theFactory = {} 

	/*
		By default, returns a mock exchange service, which has
		a backward history scan, and returns two mock trades.
	*/

	theFactory.get = (opts) => {
		var selectorObject = {normalized: 'stub.BTC-USD', exchange_id: 'stub' };
		
		if (opts === undefined) 
			opts = { }

		var rtn = {
			BACKWARD: 'backward',
			FORWARD: 'forward',
			getSelector: () => { return selectorObject; },
			getExchange: undefined
		} // exchange service

		var getTradesFunc;
		if (opts.getTradesFunc !== undefined && opts.getTradesFunc !== null)
			getTradesFunc = opts.getTradesFunc;
		else
			getTradesFunc = (opts, func) => { func(null, [{trade_id: 3000}, {trade_id: 3001}]) };

		var direction = opts.direction || 'backward';

		rtn.getExchange = () => {
			return {
				historyScan: direction,
				getTrades: getTradesFunc 
			}
		}

		return (() => rtn);
	}

	return theFactory
}