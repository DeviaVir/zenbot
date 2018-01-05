var service = require('../../../lib/engine')

describe('Engine', function() {
	describe(' executeSignal ', function() {
		describe(' when buy_max_amt less than buy_pct amount ', function(){
			// arrange
			var signalType = 'buy';
			var currencyAmount = 1;
			var buy_pct = 50;
			var buy_max_amt = 0.25;
			
			// so.mode, so.order_type, quote.bid, so.markdown_buy_pct, s.product.increment, s.balance.currency
			
			// executeSignal('buy', null, null, false, false)
			// act
			service.executeSignal(signalType);
			// assert
			// doOrder was called with 
		});
		
		describe(' when buy_max_amt more than buy_pct amount ', function(){
			// arrange
			var signalType = 'buy';
			var currencyAmount = 1;
			var buy_pct = 50;
			var buy_max_amt = 0.55;
			
			// executeSignal('buy', null, null, false, false)
			// act
			service.executeSignal(signalType);
			// assert
		
		});
		
		describe(' when buy_max_amt equals buy_pct amount ', function(){
			// arrange
			var signalType = 'buy';
			var currencyAmount = 1;
			var buy_pct = 50;
			var buy_max_amt = 0.5;
			
			// executeSignal('buy', null, null, false, false)
			// act
			service.executeSignal(signalType);
			// assert
		
		});
	})
});