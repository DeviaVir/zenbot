
var mock = require('mock-require')
var consumeAndProcessServiceFactory = require('../../../_mocks/consumeAndProcessService.mock.factory')

describe('The Backfill function', function() {
  beforeEach(function() {
    mock('../../../../lib/services/consume-and-process-service', consumeAndProcessServiceFactory)
    // DEBUGGING 
    process.on('unhandledRejection', (reason, p) => {
      console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
      // application specific logging, throwing an error, or other logic here
    })

  })

  afterEach(function(){
    mock.stopAll()
  }) 

  it('uses consumeAndProcessService to get the expected value', function() {
    
    var instance = require('../../../../commands/backfill/backfill.function')({})

    instance(10000).then((finalTrade) => {
      expect(finalTrade).toEqual({trade_id: 3001}) // this is the last trade defined by default to be returned from the mock consume and process service.
    })
  })
})
