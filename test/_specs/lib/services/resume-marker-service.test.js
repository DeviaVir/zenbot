var mock = require('mock-require')
var service = require('../../../../lib/services/resume-marker-service')
var collectionServiceFactory = require('../../../../test/_mocks/collectionService.mock.factory')

describe('Resume Marker Service', function() {
  beforeEach(function() {
    mock('../../../../lib/services/collection-service', collectionServiceFactory)
    service = mock.reRequire('../../../../lib/services/resume-marker-service')
  })

  describe('', function() {

    var conf = {selector: {normalized: 'tests.BTC-USD'}}

    it('is available', function() {
      var instance = service({})

      expect(instance).toBeDefined()
    })

    it('starts with zero ranges', function() {
      var instance = service(conf)
      expect(instance.getRanges().length).toBe(0)
    })

    it('sets an id and _id attribute on a newly created range', function() {
      var instance = service(conf)

      instance.createNewRange({trade_id:3000, time:1517787104900})

      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].id).toBeDefined
      expect(instance.getRanges()[0]._id).toBeDefined
    })

    it('has one range, after creating a range, and it only contains the trade_id we just gave it', function() {
      var instance = service(conf)
            
      instance.createNewRange({trade_id:3000, time:1517787104900})

      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(3000)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104900)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)
    })

    it('gets the correct range, when you create a range and then ask is that id in a range', function() {
      var instance = service(conf)
      var trade = {trade_id:3000, time:1517787104900}

      instance.createNewRange(trade)

      var rtn = instance.isWithinRange(trade)
      expect(rtn).toBeDefined()
      expect(rtn.from).toBe(3000)
      expect(rtn.oldest_time).toBe(1517787104900)
    })

    it('returns true when we create a range on XXX, then ask is XXX + 1 within one of any range', function() {
      var instance = service(conf)
      var trade = {trade_id:3000, time:1517787104900}

      instance.createNewRange(trade)

      var trade2 = {trade_id:3001, time:1517787104902}
      var rtn = instance.isWithinOneOfAnyRange(trade2)
      expect(rtn).toBeDefined()
      expect(rtn.from).toBe(3000)
      expect(rtn.oldest_time).toBe(1517787104900)

    })

    it('returns false when we create a range on XXX, then ask is XXX + 2 within one of any range', function() {
      var instance = service(conf)
      var trade = {trade_id:3000, time:1517787104900}

      instance.createNewRange(trade)

      var trade2 = {trade_id:3002, time:1517787104904}
      var rtn = instance.isWithinOneOfAnyRange(trade2)
      expect(rtn).not.toBeDefined()
    })

    it('extends a range', function() {
      var instance = service(conf)
      var trade = {trade_id:3000, time:1517787104900}

      instance.createNewRange(trade)

      var trade2 = {trade_id:2999, time:1517787104898}
      instance.extendARange(trade2)

      expect(instance.getRanges()[0].from).toBe(2999)
    })

    it('merges two now-adjacent ranges', function() {
      var instance = service(conf)
      var trade = {trade_id:3000, time:1517787104900}

      instance.createNewRange(trade)
      expect(instance.getRanges().length).toBe(1)

      var trade2 = {trade_id:2998, time:1517787104894}
      instance.createNewRange(trade2)
      expect(instance.getRanges().length).toBe(2)

      instance.extendARange({trade_id:2999, time:1517787104896})

      expect(instance.getRanges().length).toBe(2)
      instance.merge()

      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(2998)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104894)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)
    })

    it('pings correctly', function() {
      var instance = service(conf)
      var trade = {trade_id:3000, time:1517787104900}

      var rtn = instance.ping(trade)

      expect(rtn).toBe(3000)
      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(3000)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104900)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)

      var trade2 = {trade_id:2999, time:1517787104896}
      rtn = instance.ping(trade2)

      expect(rtn).toBe(2999)
      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(2999)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104896)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)

      // TODO: Test what happens if you give the same number. It should return that to you as the farthest so far.

      var trade3 = {trade_id:2998, time:1517787104894}
      rtn = instance.ping(trade3)

      expect(rtn).toBe(2998)
      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(2998)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104894)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)

      // break from happy path -- skip the next sequential record, should start a new range

      //var trade4 = {trade_id:2997, time:1517787104892};
      var trade4 = {trade_id:2996, time:1517787104890}
      rtn = instance.ping(trade4)

      expect(rtn).toBe(2996)
      expect(instance.getRanges().length).toBe(2)
      expect(instance.getRanges()[0].from).toBe(2998)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104894)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)
      expect(instance.getRanges()[1].from).toBe(2996)
      expect(instance.getRanges()[1].to).toBe(2996)
      expect(instance.getRanges()[1].oldest_time).toBe(1517787104890)
      expect(instance.getRanges()[1].newest_time).toBe(1517787104890)

      var trade5 = {trade_id:2995, time:1517787104888}
      rtn = instance.ping(trade5)

      expect(rtn).toBe(2995)
      expect(instance.getRanges().length).toBe(2)
      expect(instance.getRanges()[0].from).toBe(2998)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104894)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)
      expect(instance.getRanges()[1].from).toBe(2995)
      expect(instance.getRanges()[1].to).toBe(2996)
      expect(instance.getRanges()[1].oldest_time).toBe(1517787104888)
      expect(instance.getRanges()[1].newest_time).toBe(1517787104890)

      // now, throw some salt in the game, ping the record we skipped earlier
      var trade6 = {trade_id:2997, time:1517787104892}
      rtn = instance.ping(trade6)

      expect(rtn).toBe(2995)
      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(2995)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104888)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)

      expect(instance.getPingCount()).toBe(6)
    })
  })

  describe('when forward', function() {
    var conf = {selector:{normalized: 'tests.BTC-USD'} }

    it('starts with zero ranges', function() {
      var instance = service(conf)
      instance.setDirection('forward') // TODO: put this in a constants object
      expect(instance.getRanges().length).toBe(0)
    })

    it('has one range, after creating a range, and it only contains the trade_id we just gave it', function() {
      var instance = service(conf)
      instance.setDirection('forward') // TODO: put this in a constants object
            
      instance.createNewRange({trade_id:3000, time:1517787104900})

      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(3000)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104900)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)
    })

    it('gets the correct range, when you create a range and then ask is that id in a range', function() {
      var instance = service(conf)
      instance.setDirection('forward') // TODO: put this in a constants object

      var trade = {trade_id:3000, time:1517787104900}

      instance.createNewRange(trade)

      var rtn = instance.isWithinRange(trade)
      expect(rtn).toBeDefined()
      expect(rtn.from).toBe(3000)
      expect(rtn.oldest_time).toBe(1517787104900)
    })

    it('returns true when we create a range on XXX, then ask is XXX + 1 within one of any range', function() {
      var instance = service(conf)
      instance.setDirection('forward') // TODO: put this in a constants object

      var trade = {trade_id:3000, time:1517787104900}

      instance.createNewRange(trade)

      var trade2 = {trade_id:3001, time:1517787104902}
      var rtn = instance.isWithinOneOfAnyRange(trade2)
      expect(rtn).toBeDefined()
      expect(rtn.from).toBe(3000)
      expect(rtn.oldest_time).toBe(1517787104900)

    })

    it('returns false when we create a range on XXX, then ask is XXX + 2 within one of any range', function() {
      var instance = service(conf)
      instance.setDirection('forward') // TODO: put this in a constants object

      var trade = {trade_id:3000, time:1517787104900}

      instance.createNewRange(trade)

      var trade2 = {trade_id:3002, time:1517787104902}
      var rtn = instance.isWithinOneOfAnyRange(trade2)
      expect(rtn).not.toBeDefined()
    })

    it('extends a range', function() {
      var instance = service(conf)
      instance.setDirection('forward') // TODO: put this in a constants object

      var trade = {trade_id:2999, time:1517787104898}

      instance.createNewRange(trade)

      var trade2 = {trade_id:3000, time:1517787104900}
      instance.extendARange(trade2)

      expect(instance.getRanges()[0].from).toBe(2999)
      expect(instance.getRanges()[0].to).toBe(3000)
    })

    it('merges two now-adjacent ranges', function() {
      var instance = service(conf)
      instance.setDirection('forward') // TODO: put this in a constants object

      var trade = {trade_id:2998, time:1517787104894}

      instance.createNewRange(trade)
      expect(instance.getRanges().length).toBe(1)

      var trade2 = {trade_id:3000, time:1517787104900}
      instance.createNewRange(trade2)
      expect(instance.getRanges().length).toBe(2)

      instance.extendARange({trade_id:2999, time:1517787104896})

      expect(instance.getRanges().length).toBe(2)
      instance.merge()

      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(2998)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104894)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)
    })

    it('pings correctly', function() {
      var instance = service(conf)
      instance.setDirection('forward') // TODO: put this in a constants object

      var trade = {trade_id:3000, time:1517787104900}

      var rtn = instance.ping(trade)

      expect(rtn).toBe(3000)
      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(3000)
      expect(instance.getRanges()[0].to).toBe(3000)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104900)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104900)

      var trade2 = {trade_id:3001, time:1517787104902}
      rtn = instance.ping(trade2)

      expect(rtn).toBe(3001)
      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(3000)
      expect(instance.getRanges()[0].to).toBe(3001)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104900)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104902)

      // TODO: Test what happens if you give the same number. It should return that to you as the farthest so far.

      var trade3 = {trade_id:3002, time:1517787104904}
      rtn = instance.ping(trade3)

      expect(rtn).toBe(3002)
      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(3000)
      expect(instance.getRanges()[0].to).toBe(3002)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104900)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104904)

      // break from happy path -- skip the next sequential record, should start a new range

      //var trade4 = {trade_id:3004, time:1517787104906};
      var trade4 = {trade_id:3004, time:1517787104906}
      rtn = instance.ping(trade4)

      expect(rtn).toBe(3004)
      expect(instance.getRanges().length).toBe(2)
      expect(instance.getRanges()[0].from).toBe(3000)
      expect(instance.getRanges()[0].to).toBe(3002)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104900)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104904)
      expect(instance.getRanges()[1].from).toBe(3004)
      expect(instance.getRanges()[1].to).toBe(3004)
      expect(instance.getRanges()[1].oldest_time).toBe(1517787104906)
      expect(instance.getRanges()[1].newest_time).toBe(1517787104906)

      var trade5 = {trade_id:3005, time:1517787104908}
      rtn = instance.ping(trade5)

      expect(rtn).toBe(3005)
      expect(instance.getRanges().length).toBe(2)
      expect(instance.getRanges()[0].from).toBe(3000)
      expect(instance.getRanges()[0].to).toBe(3002)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104900)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104904)
      expect(instance.getRanges()[1].from).toBe(3004)
      expect(instance.getRanges()[1].to).toBe(3005)
      expect(instance.getRanges()[1].oldest_time).toBe(1517787104906)
      expect(instance.getRanges()[1].newest_time).toBe(1517787104908)

      // now, throw some salt in the game, ping the record we skipped earlier
      var trade6 = {trade_id:3003, time:1517787104905}
      rtn = instance.ping(trade6)

      expect(rtn).toBe(3005)
      expect(instance.getRanges().length).toBe(1)
      expect(instance.getRanges()[0].from).toBe(3000)
      expect(instance.getRanges()[0].to).toBe(3005)
      expect(instance.getRanges()[0].oldest_time).toBe(1517787104900)
      expect(instance.getRanges()[0].newest_time).toBe(1517787104908)
    })
  })

  describe('database stuff', function() {
    var conf = {selector: {normalized: 'tests.BTC-USD'}, resumeMarkersArray: []}

    it('still calls the callback when flush is called and there are no ranges', function() {
      var instance = service(conf)

      instance.load()

      expect(instance.getRanges().length).toBe(0)

      var cb = jasmine.createSpy('flushCallback')
      instance.flush(cb)

      expect(cb).toHaveBeenCalled()
    })
  })

  describe('database stuff', function() {
    var conf = {
      selector: {normalized: 'tests.BTC-USD'},
      resumeMarkersArray: [	{from: 2994, to: 2998, oldest_time: 1517787104960, newest_time: 1517787104986},
        {from: 2894, to: 2898, oldest_time: 1517787103960, newest_time: 1517787103986},
        {from: 2794, to: 2798, oldest_time: 1517787102960, newest_time: 1517787102986}
      ],
      mockDeleteManyFunction: jasmine.createSpy('mockDeleteManyFunction'),
      mockInsertManyFunction: jasmine.createSpy('mockInsertManyFunction')
    }

    it('loads records from the database correctly', function() {
      var instance = service(conf)

      instance.load()

      expect(instance.getRanges().length).toBe(3)
    })

    it('writes changed records correctly', function() {

      var instance = service(conf)

      instance.load()

      var range = instance.getRanges()[0]

      range.from -= 1

      instance.flush()

      expect(conf.mockDeleteManyFunction).toHaveBeenCalled()
      expect(conf.mockInsertManyFunction).toHaveBeenCalled()
    })
  })

  describe('ping count', function() {
    var conf = {selector: {normalized: 'tests.BTC-USD'}}


    it('increases, but not when a number is already in range', function() {
      var instance = service(conf)

      var trade = {trade_id:3000, time:1517787104900}
      instance.ping(trade)

      var trade2 = {trade_id:2999, time:1517787104896}
      instance.ping(trade2)

      // this should already be in range
      instance.ping(trade)
      expect(instance.getPingCount()).toBe(2)
    })

    it('increases when direction is FORWARD, but not when a number is already in range', function() {
      var instance = service(conf)
      instance.setDirection('forward') // TODO: put this in a constants object			

      var trade = {trade_id:2999, time:1517787104900}
      instance.ping(trade)

      var trade2 = {trade_id:3000, time:1517787104896}
      instance.ping(trade2)

      // this should already be in range
      instance.ping(trade)
      expect(instance.getPingCount()).toBe(2)
    })
  })

})