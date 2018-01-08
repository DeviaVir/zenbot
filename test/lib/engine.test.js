describe("Engine", function() {
	describe("executeSignal", function() {
		describe("when maker", function(){
			it("with buy_max_amt less than buy_pct amount should use buy_max_amt", function(){
				// arrange
				var signal_type = "buy"
				var currency_amount = 1
				var buy_pct = 50
				var buy_max_amt = 0.25
				var order_type = "maker"			
				var buy_spy = jasmine.createSpy()
				var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, buy_spy)
				// act
				sut.executeSignal(signal_type)
				// assert
				var expected = "2.77500000"
				var buyArgs = buy_spy.calls.mostRecent().args[0]
				expect(buyArgs.size).toBe(expected)
			})
			
			it("with buy_max_amt more than buy_pct amount should use buy_pct", function(){
				// arrange
				var signal_type = "buy"
				var currency_amount = 1
				var buy_pct = 50
				var buy_max_amt = 0.75
				var order_type = "maker"			
				var buy_spy = jasmine.createSpy()
				var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, buy_spy)
				// act
				sut.executeSignal(signal_type)
				// assert
				var expected = "5.55000000"
				var buyArgs = buy_spy.calls.mostRecent().args[0]
				expect(buyArgs.size).toBe(expected)
			})
			
			it("with buy_max_amt equals buy_pct amount should use buy_pct", function(){
				// arrange
				var signal_type = "buy"
				var currency_amount = 1
				var buy_pct = 50
				var buy_max_amt = 0.50
				var order_type = "maker"			
				var buy_spy = jasmine.createSpy()
				var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, buy_spy)
				// act
				sut.executeSignal(signal_type)
				// assert
				var expected = "5.55000000"
				var buyArgs = buy_spy.calls.mostRecent().args[0]
				expect(buyArgs.size).toBe(expected)
			})
		})
		
		describe("when taker", function(){
			it("with buy_max_amt less than buy_pct amount should use buy_max_amt", function(){
				// arrange
				var signal_type = "buy"
				var currency_amount = 1
				var buy_pct = 50
				var buy_max_amt = 0.25
				var order_type = "taker"
				var buy_spy = jasmine.createSpy()
				var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, buy_spy)
				// act
				sut.executeSignal(signal_type)
				// assert
				var expected = "2.77222222"
				var buyArgs = buy_spy.calls.mostRecent().args[0]
				expect(buyArgs.size).toBe(expected)
			})
			
			it("with buy_max_amt more than buy_pct amount should use buy_pct", function(){
				// arrange
				var signal_type = "buy"
				var currency_amount = 1
				var buy_pct = 50
				var buy_max_amt = 0.75
				var order_type = "taker"			
				var buy_spy = jasmine.createSpy()
				var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, buy_spy)
				// act
				sut.executeSignal(signal_type)
				// assert
				var expected = "5.54444444"
				var buyArgs = buy_spy.calls.mostRecent().args[0]
				expect(buyArgs.size).toBe(expected)
			})
			
			it("with buy_max_amt equals buy_pct amount should use buy_pct", function(){
				// arrange
				var signal_type = "buy"
				var currency_amount = 1
				var buy_pct = 50
				var buy_max_amt = 0.50
				var order_type = "taker"			
				var buy_spy = jasmine.createSpy()
				var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, buy_spy)
				// act
				sut.executeSignal(signal_type)
				// assert
				var expected = "5.54444444"
				var buyArgs = buy_spy.calls.mostRecent().args[0]
				expect(buyArgs.size).toBe(expected)
			})
		})
	})
})

function createEngine(currency_amount, buy_pct, buy_max_amt, order_type, buy_spy){	
	var fake_asset = "test_asset"
	var fake_currency = "BTC"
	var fake_exchange = "test_exchange"
	var fake_project = "test_product"
	var fake_bid = 0.10
	var fake_ask = 0.11
	var fake_balance = { currency: currency_amount, asset:0}
	
	var fakes = {
		get: function() { },
		set: function() { },
		clear: function() { }
	}
	
	var fake_product = {
		"asset": fake_asset,
		"currency": fake_currency,
		"min_total": "0.1",
		"max_size": null,
		"increment": "0.01",
		"label": "Test TST/BTC"
	  }

	var fake_return = {
		"conf": {},
		"exchanges.test_exchange" : {
			getProducts: function() { return [fake_product] },
			getQuote: function(product, callback){ callback(null, { bid: fake_bid, ask: fake_ask}) },
			getBalance: function(args, callback){ return callback(null, fake_balance)},
			buy: buy_spy,
			name: fake_exchange,
			makerFee: 0.1,
			takerFee: 0.2
		},
		"lib.notify": {
			pushMessage: function(title, message){ }
		}
	}
	
	spyOn(fakes,"get").and.callFake(function(param){
		return fake_return[param]
	})
	
	var engine = require("../../lib/engine")(fakes.get, fakes.set, fakes.clear)
	var input = {
		options: {
			selector: {
				exchange_id:fake_exchange,
				product_id:fake_project,
				asset:fake_asset,
				currency: fake_currency
			},
			period: "30m",
			markdown_buy_pct : 2,
			mode:"live",
			order_type: order_type,
			buy_pct:buy_pct,
			buy_max_amt:buy_max_amt
		}
	}
	return engine(input)
}