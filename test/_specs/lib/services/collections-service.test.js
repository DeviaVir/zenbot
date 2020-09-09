
var service = require('../../../../lib/services/collection-service')

describe('Collections Service', function() {

  describe(' trades ', function() {
   
    it('is available', function() {
      expect(service).not.toBe(undefined)
    }),

    it('returns the expected objects', function() {

      var instance = service({db:{mongo:{collection: function() { return { ensureIndex: function() { }} }  }}})

      var rtn = instance.getTrades()

      expect(rtn).toBeDefined()
    })
  }),

  describe(' resume_markers ', function() {
    
    it('is available', function() {
      expect(service).not.toBe(undefined)
    }),

    it('returns the expected objects', function() {

      var instance = service({db:{mongo:{collection: function() { return { ensureIndex: function() { }} }  }}})

      var rtn = instance.getResumeMarkers()

      expect(rtn).toBeDefined()
    })
  })
})
