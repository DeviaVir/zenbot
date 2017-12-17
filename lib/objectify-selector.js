module.exports = function container(get, set, clear) {
	
	// I know that other functions don't have container, they just return 
	//  the function, but I want this to be container-ized because its cleaner.
	//  the calling function just needs to pass the selector, as it is defined in
	//  a cmd line option.
	return function(selector) {
		var s = get('lib.normalize-selector')(selector)

		var e_id = s.split('.')[0]
		var p_id = s.split('.')[1]
		var asset = p_id.split('-')[0]
		var currency = p_id.split('-')[1];

        return {exchange_id: e_id, product_id: p_id, asset: asset, currency: currency, normalized: s}
	}
}