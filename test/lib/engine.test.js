describe('Engine', function() {
  describe('executeSignal', function() {
    describe('when maker in live mode', function(){
      describe('with buy_max set', function(){
        it('and no held assets should use raw buy_max_amt', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1.0
          var buy_pct = 50
          var buy_max_amt = 0.25
          var order_type = 'maker'
          var held_asset = 0
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          var expected = '2.77500000'
          var buyArgs = buy_spy.calls.mostRecent().args[0]
          expect(buyArgs.size).toBe(expected)
        })
        it('and held assets should use adjusted buy_max_amt', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 3.0
          var buy_pct = 50
          var buy_max_amt = 0.25
          var order_type = 'maker'
          var held_asset = 0.75
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          var expected = '1.85925000'
          var buyArgs = buy_spy.calls.mostRecent().args[0]
          expect(buyArgs.size).toBe(expected)
        })
        it('and held assets so large adjusted buy_max_amt is below order minimum should not place order', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1.0
          var buy_pct = 50
          var buy_max_amt = 0.25
          var order_type = 'maker'
          var held_asset = 2.0
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          expect(buy_spy).not.toHaveBeenCalled()
        })
      })
      describe('with no buy_max set', function(){
        it('and no held assets should use raw buy_pct', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1.0
          var buy_pct = 50
          var buy_max_amt = undefined
          var order_type = 'maker'
          var held_asset = 0				
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          var expected = '5.55000000'
          var buyArgs = buy_spy.calls.mostRecent().args[0]
          expect(buyArgs.size).toBe(expected)
        })
        it('and held assets should use adjusted buy_pct', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1.0
          var buy_pct = 50
          var buy_max_amt = undefined
          var order_type = 'maker'
          var held_asset = 0.5				
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          var expected = '4.93950000'
          var buyArgs = buy_spy.calls.mostRecent().args[0]
          expect(buyArgs.size).toBe(expected)
        })
        it('and held assets so large adjusted buy_pct is below order minimum should not place order', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1.0
          var buy_pct = 50
          var buy_max_amt = undefined
          var order_type = 'maker'
          var held_asset = 5.25				
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          expect(buy_spy).not.toHaveBeenCalled()
        })
      })
    })
    
    describe('when taker in live mode', function(){
      describe('with buy_max_amt set',function(){
        it('and no held assets should use raw buy_max_amt', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1
          var buy_pct = 50
          var buy_max_amt = 0.25
          var order_type = 'taker'
          var held_asset = 0
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          var expected = '2.77222222'
          var buyArgs = buy_spy.calls.mostRecent().args[0]
          expect(buyArgs.size).toBe(expected)
        })
        
        it('and held assets should use adjusted buy_max_amt', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 3.0
          var buy_pct = 50
          var buy_max_amt = 0.25
          var order_type = 'taker'
          var held_asset = 0.75
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          var expected = '1.85738888'
          var buyArgs = buy_spy.calls.mostRecent().args[0]
          expect(buyArgs.size).toBe(expected)
        })
        
        it('and held assets so large adjusted buy_max_amt is below order minimum should not place order', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1.0
          var buy_pct = 50
          var buy_max_amt = 0.25
          var order_type = 'taker'
          var held_asset = 2.0
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          expect(buy_spy).not.toHaveBeenCalled()
        })
      })
      describe('with no buy_max_amt set',function(){
        it('with no buy_max_amt set and no held assets should use raw buy_pct', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1
          var buy_pct = 50
          var buy_max_amt = undefined
          var order_type = 'taker'
          var held_asset = 0
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          var expected = '5.54444444'
          var buyArgs = buy_spy.calls.mostRecent().args[0]
          expect(buyArgs.size).toBe(expected)
        })
        it('and held assets should use adjusted buy_pct', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1.0
          var buy_pct = 50
          var buy_max_amt = undefined
          var order_type = 'taker'
          var held_asset = 0.5				
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          var expected = '4.93455555'
          var buyArgs = buy_spy.calls.mostRecent().args[0]
          expect(buyArgs.size).toBe(expected)
        })
        it('and held assets so large adjusted buy_pct is below order minimum should not place order', function(){
          // arrange
          var signal_type = 'buy'
          var currency_amount = 1.0
          var buy_pct = 50
          var buy_max_amt = undefined
          var order_type = 'taker'
          var held_asset = 5.25				
          var buy_spy = jasmine.createSpy()
          var sut = createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy)
          // act
          sut.executeSignal(signal_type)
          // assert
          expect(buy_spy).not.toHaveBeenCalled()
        })
      })
    })
  })
})

var mock = require('mock-require')
var path = require('path')

function createEngine(currency_amount, buy_pct, buy_max_amt, order_type, held_asset, buy_spy){	
  var fake_asset = 'test_asset'
  var fake_currency = 'BTC'
  var fake_exchange = 'test_exchange'
  var fake_project = 'test_product'
  var fake_bid = 0.10
  var fake_ask = 0.11
  var fake_balance = { currency: currency_amount, asset:held_asset}
  
  var fakes = {
    get: function() { },
    set: function() { },
    clear: function() { }
  }
  
  var fake_product = {
    'asset': fake_asset,
    'currency': fake_currency,
    'min_total': '0.1',
    'max_size': null,
    'increment': '0.01',
    'label': 'Test TST/BTC'
  }

  var fake_return = {
    'conf': {
      output: {
        api: {}
      }
    },
    'exchanges.test_exchange' : function() { return {
      getProducts: function() { return [fake_product] },
      getQuote: function(product, callback){ callback(null, { bid: fake_bid, ask: fake_ask}) },
      getBalance: function(args, callback){ return callback(null, fake_balance)},
      buy: buy_spy,
      name: fake_exchange,
      makerFee: 0.1,
      takerFee: 0.2
    }
    },
    'lib.notify': {
      pushMessage: function(/*title, message*/){ }
    }
  }
  var exchange_path = path.resolve(__dirname, '../../extensions/exchanges/test_exchange/exchange')
  mock(exchange_path, fake_return['exchanges.test_exchange'])
  mock('./notify', fake_return['lib.notify'])
  
  spyOn(fakes,'get').and.callFake(function(param){
    return fake_return[param]
  })
  
  var input = {
    options: {
      selector: {
        exchange_id:fake_exchange,
        product_id:fake_project,
        asset:fake_asset,
        currency: fake_currency
      },
      period: '30m',
      markdown_buy_pct : 2,
      mode:'live',
      order_type: order_type,
      buy_pct:buy_pct,
      buy_max_amt:buy_max_amt
    }
  }
  var engine = require('../../lib/engine')
  
  return engine(input, fake_return['conf'])
}