var mock = require('mock-require')
var collectionServiceFactory = require('../../../../test/_mocks/collectionService.mock.factory')
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')

describe('The Backfill Process function', function() {
  var queue

  beforeEach(function() {
    mock('../../../../lib/services/collection-service', collectionServiceFactory)
    mock('../../../../lib/services/exchange-service', exchangeServiceFactory)
    mock('../../../../lib/_data-structures/Queue', queue)

    queue = {
      enqueue: function() { },
      dequeue: function() { }
    }
  })

  afterEach(function(){
    mock.stopAll()
  })

  describe('processes trades ', function() {

    beforeEach(function () {
      spyOn(queue, 'dequeue').and.returnValue([{trade_id:3002, time:1517787104904}, {trade_id:3001, time:1517787104902}, {trade_id:3000, time:1517787104900}])
    })

    it('when all are considered new', function() {
      var callback = jasmine.createSpy('callback')
      var instance = mock.reRequire('../../../../commands/backfill/backfill.process.function')({})

      var targetTimeInMillis = 1517787104899
      instance(targetTimeInMillis, queue, (trade) => { return trade.trade_id }, callback)

      expect(queue.dequeue.calls.count()).toEqual(1)
      expect(callback.calls.count()).toEqual(1) 
      expect(callback).toHaveBeenCalledWith(null, false, 3000, {trade_id:3000, time:1517787104900})
    })
  })

  describe('indicates exit condition was reached when one of the trades is past our time limit', function() {
    beforeEach(function () {
      spyOn(queue, 'dequeue').and.returnValue([{trade_id:3002, time:1517787104904}, {trade_id:3001, time:1517787104902}, {trade_id:3000, time:1517787104900}])
    })

    it('', function() {
      var callback = jasmine.createSpy('callback')
      var instance =  mock.reRequire('../../../../commands/backfill/backfill.process.function')({})

      var targetTimeInMillis = 1517787104901
      instance(targetTimeInMillis, queue, (trade) => { return trade.trade_id }, callback)

      expect(queue.dequeue.calls.count()).toEqual(1)
      expect(callback.calls.count()).toEqual(1)
      expect(callback).toHaveBeenCalledWith(null, true, 3001, {trade_id:3001, time:1517787104902})
    })
  })

    
  // TODO
  xdescribe('does not insert records that have already been seen', function() {
    beforeEach(function () {

      spyOn(queue, 'dequeue').and.returnValue([{trade_id:3002, time:1517787104904}, {trade_id:3001, time:1517787104902}, {trade_id:3000, time:1517787104900}])
    })

    it('', function() {
      var callback = jasmine.createSpy('callback')
      var instance =  require('../../../../commands/backfill/backfill.process.function')({})

      var targetTimeInMillis = 1517787104900
      instance(targetTimeInMillis, queue, callback)

      expect(queue.dequeue.calls.count()).toEqual(1)
      expect(callback.calls.count()).toEqual(1)
      expect(callback).toHaveBeenCalledWith(null, false, {trade_id: 3002, time: 1517787104904}) 
            
      // TODO: How to check that theFunction only called the mockCollectionService twice? 
      //  Because there should only be two inserts when the third is reported as 'already seen'.
    })
  })

})