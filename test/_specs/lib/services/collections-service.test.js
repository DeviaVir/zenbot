
var service = require('../../../../lib/services/collection-service')

describe('Collections Service', function() {
	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}
	})

	describe(' trades ', function() {
		beforeEach(function() {
			spyOn(foo, 'get').and.returnValue({collection: function() { return { ensureIndex: function() { }} }  });
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		}),

		it('returns the expected objects', function() {

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getTrades()

			expect(rtn).toBeDefined();
		})
	}),

	describe(' resume_markers ', function() {
		beforeEach(function() {
			spyOn(foo, 'get').and.returnValue({collection: function() { return { ensureIndex: function() { }} }  });
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		}),

		it('returns the expected objects', function() {

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getResumeMarkers()

			expect(rtn).toBeDefined();
		})
	})
});
