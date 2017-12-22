
var service = require('../../../lib/services/collection-service')

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
			spyOn(foo, 'get').and.returnValues([1, 2, 3], {collection: function() { return { ensureIndex: function() { }} }  });
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		}),

		it('returns the expected objects', function() {

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getTrades()

			expect(rtn).toBeDefined();
			expect(rtn.length).toEqual(3);
			expect(rtn[0]).toEqual(1);
			expect(rtn[1]).toEqual(2);
			expect(rtn[2]).toEqual(3);
		})
	}),

	describe(' resume_markers ', function() {
		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues([1, 2, 3], {collection: function() { return { ensureIndex: function() { }} }  });
		})

		it('is available', function() {
			expect(service).not.toBe(undefined);
		}),

		it('returns the expected objects', function() {

			var instance = service(foo.get, foo.set, foo.clear)

			var rtn = instance.getResumeMarkers()

			expect(rtn).toBeDefined();
			expect(rtn.length).toEqual(3);
			expect(rtn[0]).toEqual(1);
			expect(rtn[1]).toEqual(2);
			expect(rtn[2]).toEqual(3);
		})
	})
});
