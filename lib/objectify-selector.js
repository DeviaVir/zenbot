module.exports = function container(get, set, clear) {
	return function(selector) {
		var rtn

		if (typeof selector == 'string') {
			var s = get('lib.normalize-selector')(selector)

			var e_id = s.split('.')[0]
			var p_id = s.split('.')[1]
			var asset = p_id.split('-')[0]
			var currency = p_id.split('-')[1];

	        rtn = {exchange_id: e_id, product_id: p_id, asset: asset, currency: currency, normalized: s}
    	} 
    	else if (typeof selector == 'object') {
    		rtn = selector
    	}

    	return rtn;
	}
}