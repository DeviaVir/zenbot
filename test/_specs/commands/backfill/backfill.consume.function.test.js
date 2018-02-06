
var mock = require('mock-require')
var tradeServiceFactory = require('../../../../test/_mocks/tradeService.mock.factory')

describe('The Backfill Consume function', function() {
  var queue
  beforeEach(function() {
    mock('../../../../lib/services/trades-service', tradeServiceFactory)
    queue = {
      enqueue: function() { },
      dequeue: function() { }
    }
    spyOn(queue, 'enqueue').and.returnValue({ })
  })

  afterEach(function(){
    mock.stopAll()
  })

  describe('consumes trades from the trade service, indicates the next step should be Processing, rather than Exit', function() {

    it('', function() {
      var callback = jasmine.createSpy('callback')
            
      var instance = require('../../../../commands/backfill/backfill.consume.function')({tradesArray: [{trade_id: 3001, time: 99994}, {trade_id: 3000, time: 99992}]})

      instance(undefined, queue, callback)

      expect(callback.calls.count()).toEqual(1) 
      expect(callback).toHaveBeenCalledWith(null, 'cp_process', 3000)
      expect(queue.enqueue).toHaveBeenCalledWith([{trade_id: 3001, time: 99994}, {trade_id: 3000, time: 99992}])
    })
  })

  describe('consumes trades from the trade service, indicates the next step should be Exit, rather than Processing', function() {
    it('', function() {
      var callback = jasmine.createSpy('callback')
            
      var instance = require('../../../../commands/backfill/backfill.consume.function')({})

      instance(undefined, queue, callback)

      expect(callback.calls.count()).toEqual(1) 
      expect(callback).toHaveBeenCalledWith(null, 'cp_exit', undefined)
      expect(queue.enqueue).not.toHaveBeenCalled()
    })
  })


})