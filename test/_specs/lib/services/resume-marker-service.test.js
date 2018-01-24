var service = require('../../../../lib/services/resume-marker-service')
var collectionServiceFactory = require('../../../../test/_mocks/collectionService.mock.factory')()

describe('Resume Marker Service', function() {
	beforeEach(function() {
		foo = {
			get: function() { },
			set: function() { },
			clear: function() { }
		}
	})

	describe('', function() {
		var mockCollectionService = collectionServiceFactory.get();

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				{},
				() => { return {normalized: 'tests.BTC-USD'}},
				mockCollectionService
				)
		})

		it('is available', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			expect(instance).toBeDefined();
		})

		it('starts with zero ranges', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			expect(instance.getRanges().length).toBe(0);
		})

		it('has one range, after creating a range, and it only contains the trade_id we just gave it', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			
			instance.createNewRange({trade_id:1300, time:990000});

			expect(instance.getRanges().length).toBe(1);
			expect(instance.getRanges()[0].from).toBe(1300);
			expect(instance.getRanges()[0].to).toBe(1300);
			expect(instance.getRanges()[0].oldest_time).toBe(990000);
			expect(instance.getRanges()[0].newest_time).toBe(990000);
		})

		it('gets the correct range, when you create a range and then ask is that id in a range', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			var trade = {trade_id:1300, time:990000};

			instance.createNewRange(trade);

			var rtn = instance.isWithinRange(trade)
			expect(rtn).toBeDefined();
			expect(rtn.from).toBe(1300);
			expect(rtn.oldest_time).toBe(990000);
		})

		it('returns true when we create a range on XXX, then ask is XXX + 1 within one of any range', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			var trade = {trade_id:1300, time:990000};

			instance.createNewRange(trade)

			var trade2 = {trade_id:1301, time:990001};
			var rtn = instance.isWithinOneOfAnyRange(trade2)
			expect(rtn).toBeDefined();
			expect(rtn.from).toBe(1300);
			expect(rtn.oldest_time).toBe(990000);

		})

		it('returns false when we create a range on XXX, then ask is XXX + 2 within one of any range', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			var trade = {trade_id:1300, time:990000};

			instance.createNewRange(trade)

			var trade2 = {trade_id:1302, time:990002};
			var rtn = instance.isWithinOneOfAnyRange(trade2)
			expect(rtn).not.toBeDefined();
		})

		it('extends a range', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			var trade = {trade_id:1300, time:990000};

			instance.createNewRange(trade)

			var trade2 = {trade_id:1299, time:989998};
			instance.extendARange(trade2)

			expect(instance.getRanges()[0].from).toBe(1299)
		})

		it('merges two now-adjacent ranges', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			var trade = {trade_id:1300, time:990000};

			instance.createNewRange(trade)
			expect(instance.getRanges().length).toBe(1)

			var trade2 = {trade_id:1298, time:989994};
			instance.createNewRange(trade2)
			expect(instance.getRanges().length).toBe(2)

			instance.extendARange({trade_id:1299, time:989996})

			expect(instance.getRanges().length).toBe(2)
			instance.merge()

			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1298)
			expect(instance.getRanges()[0].to).toBe(1300)
			expect(instance.getRanges()[0].oldest_time).toBe(989994)
			expect(instance.getRanges()[0].newest_time).toBe(990000)
		})

		it('pings correctly', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			var trade = {trade_id:1300, time:990000};

			var rtn = instance.ping(trade);

			expect(rtn).toBe(1300)
			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1300)
			expect(instance.getRanges()[0].to).toBe(1300)
			expect(instance.getRanges()[0].oldest_time).toBe(990000)
			expect(instance.getRanges()[0].newest_time).toBe(990000)

			var trade2 = {trade_id:1299, time:989996};
			rtn = instance.ping(trade2);

			expect(rtn).toBe(1299)
			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1299)
			expect(instance.getRanges()[0].to).toBe(1300)
			expect(instance.getRanges()[0].oldest_time).toBe(989996)
			expect(instance.getRanges()[0].newest_time).toBe(990000)

			// TODO: Test what happens if you give the same number. It should return that to you as the farthest so far.

			var trade3 = {trade_id:1298, time:989994};
			rtn = instance.ping(trade3);

			expect(rtn).toBe(1298)
			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1298)
			expect(instance.getRanges()[0].to).toBe(1300)
			expect(instance.getRanges()[0].oldest_time).toBe(989994)
			expect(instance.getRanges()[0].newest_time).toBe(990000)

			// break from happy path -- skip the next sequential record, should start a new range

			//var trade4 = {trade_id:1297, time:989992};
			var trade4 = {trade_id:1296, time:989990};
			rtn = instance.ping(trade4);

			expect(rtn).toBe(1296)
			expect(instance.getRanges().length).toBe(2)
			expect(instance.getRanges()[0].from).toBe(1298)
			expect(instance.getRanges()[0].to).toBe(1300)
			expect(instance.getRanges()[0].oldest_time).toBe(989994)
			expect(instance.getRanges()[0].newest_time).toBe(990000)
			expect(instance.getRanges()[1].from).toBe(1296)
			expect(instance.getRanges()[1].to).toBe(1296)
			expect(instance.getRanges()[1].oldest_time).toBe(989990)
			expect(instance.getRanges()[1].newest_time).toBe(989990)

			var trade5 = {trade_id:1295, time:989988};
			rtn = instance.ping(trade5);

			expect(rtn).toBe(1295)
			expect(instance.getRanges().length).toBe(2)
			expect(instance.getRanges()[0].from).toBe(1298)
			expect(instance.getRanges()[0].to).toBe(1300)
			expect(instance.getRanges()[0].oldest_time).toBe(989994)
			expect(instance.getRanges()[0].newest_time).toBe(990000)
			expect(instance.getRanges()[1].from).toBe(1295)
			expect(instance.getRanges()[1].to).toBe(1296)
			expect(instance.getRanges()[1].oldest_time).toBe(989988)
			expect(instance.getRanges()[1].newest_time).toBe(989990)

			// now, throw some salt in the game, ping the record we skipped earlier
			var trade6 = {trade_id:1297, time:989992};
			rtn = instance.ping(trade6);

			expect(rtn).toBe(1295)
			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1295)
			expect(instance.getRanges()[0].to).toBe(1300)
			expect(instance.getRanges()[0].oldest_time).toBe(989988)
			expect(instance.getRanges()[0].newest_time).toBe(990000)
		})
	})

	describe('when forward', function() {
		var mockCollectionService = collectionServiceFactory.get();

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				{},
				() => { return {normalized: 'tests.BTC-USD'}},
				mockCollectionService
				)
		})

		it('starts with zero ranges', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			instance.setDirection('forward') // TODO: put this in a constants object
			expect(instance.getRanges().length).toBe(0);
		})

		it('has one range, after creating a range, and it only contains the trade_id we just gave it', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			instance.setDirection('forward') // TODO: put this in a constants object
			
			instance.createNewRange({trade_id:1300, time:990000});

			expect(instance.getRanges().length).toBe(1);
			expect(instance.getRanges()[0].from).toBe(1300);
			expect(instance.getRanges()[0].to).toBe(1300);
			expect(instance.getRanges()[0].oldest_time).toBe(990000);
			expect(instance.getRanges()[0].newest_time).toBe(990000);
		})

		it('gets the correct range, when you create a range and then ask is that id in a range', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			instance.setDirection('forward') // TODO: put this in a constants object

			var trade = {trade_id:1300, time:990000};

			instance.createNewRange(trade);

			var rtn = instance.isWithinRange(trade)
			expect(rtn).toBeDefined();
			expect(rtn.from).toBe(1300);
			expect(rtn.oldest_time).toBe(990000);
		})

		it('returns true when we create a range on XXX, then ask is XXX + 1 within one of any range', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			instance.setDirection('forward') // TODO: put this in a constants object

			var trade = {trade_id:1300, time:990000};

			instance.createNewRange(trade)

			var trade2 = {trade_id:1301, time:990001};
			var rtn = instance.isWithinOneOfAnyRange(trade2)
			expect(rtn).toBeDefined();
			expect(rtn.from).toBe(1300);
			expect(rtn.oldest_time).toBe(990000);

		})

		it('returns false when we create a range on XXX, then ask is XXX + 2 within one of any range', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			instance.setDirection('forward') // TODO: put this in a constants object

			var trade = {trade_id:1300, time:990000};

			instance.createNewRange(trade)

			var trade2 = {trade_id:1302, time:990002};
			var rtn = instance.isWithinOneOfAnyRange(trade2)
			expect(rtn).not.toBeDefined();
		})

		it('extends a range', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			instance.setDirection('forward') // TODO: put this in a constants object

			var trade = {trade_id:1299, time:989998};

			instance.createNewRange(trade)

			var trade2 = {trade_id:1300, time:990000};
			instance.extendARange(trade2)

			expect(instance.getRanges()[0].from).toBe(1299)
			expect(instance.getRanges()[0].to).toBe(1300)
		})

		it('merges two now-adjacent ranges', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			instance.setDirection('forward') // TODO: put this in a constants object

			var trade = {trade_id:1298, time:989994};

			instance.createNewRange(trade)
			expect(instance.getRanges().length).toBe(1)

			var trade2 = {trade_id:1300, time:990000};
			instance.createNewRange(trade2)
			expect(instance.getRanges().length).toBe(2)

			instance.extendARange({trade_id:1299, time:989996})

			expect(instance.getRanges().length).toBe(2)
			instance.merge()

			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1298)
			expect(instance.getRanges()[0].to).toBe(1300)
			expect(instance.getRanges()[0].oldest_time).toBe(989994)
			expect(instance.getRanges()[0].newest_time).toBe(990000)
		})

		it('pings correctly', function() {
			var instance = service(foo.get, foo.set, foo.clear)
			instance.setDirection('forward') // TODO: put this in a constants object

			var trade = {trade_id:1300, time:990000};

			var rtn = instance.ping(trade);

			expect(rtn).toBe(1300)
			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1300)
			expect(instance.getRanges()[0].to).toBe(1300)
			expect(instance.getRanges()[0].oldest_time).toBe(990000)
			expect(instance.getRanges()[0].newest_time).toBe(990000)

			var trade2 = {trade_id:1301, time:990002};
			rtn = instance.ping(trade2);

			expect(rtn).toBe(1301)
			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1300)
			expect(instance.getRanges()[0].to).toBe(1301)
			expect(instance.getRanges()[0].oldest_time).toBe(990000)
			expect(instance.getRanges()[0].newest_time).toBe(990002)

			// TODO: Test what happens if you give the same number. It should return that to you as the farthest so far.

			var trade3 = {trade_id:1302, time:990004};
			rtn = instance.ping(trade3);

			expect(rtn).toBe(1302)
			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1300)
			expect(instance.getRanges()[0].to).toBe(1302)
			expect(instance.getRanges()[0].oldest_time).toBe(990000)
			expect(instance.getRanges()[0].newest_time).toBe(990004)

			// break from happy path -- skip the next sequential record, should start a new range

			//var trade4 = {trade_id:1304, time:990006};
			var trade4 = {trade_id:1304, time:990006};
			rtn = instance.ping(trade4);

			expect(rtn).toBe(1304)
			expect(instance.getRanges().length).toBe(2)
			expect(instance.getRanges()[0].from).toBe(1300)
			expect(instance.getRanges()[0].to).toBe(1302)
			expect(instance.getRanges()[0].oldest_time).toBe(990000)
			expect(instance.getRanges()[0].newest_time).toBe(990004)
			expect(instance.getRanges()[1].from).toBe(1304)
			expect(instance.getRanges()[1].to).toBe(1304)
			expect(instance.getRanges()[1].oldest_time).toBe(990006)
			expect(instance.getRanges()[1].newest_time).toBe(990006)

			var trade5 = {trade_id:1305, time:990008};
			rtn = instance.ping(trade5);

			expect(rtn).toBe(1305)
			expect(instance.getRanges().length).toBe(2)
			expect(instance.getRanges()[0].from).toBe(1300)
			expect(instance.getRanges()[0].to).toBe(1302)
			expect(instance.getRanges()[0].oldest_time).toBe(990000)
			expect(instance.getRanges()[0].newest_time).toBe(990004)
			expect(instance.getRanges()[1].from).toBe(1304)
			expect(instance.getRanges()[1].to).toBe(1305)
			expect(instance.getRanges()[1].oldest_time).toBe(990006)
			expect(instance.getRanges()[1].newest_time).toBe(990008)

			// now, throw some salt in the game, ping the record we skipped earlier
			var trade6 = {trade_id:1303, time:990005};
			rtn = instance.ping(trade6);

			expect(rtn).toBe(1305)
			expect(instance.getRanges().length).toBe(1)
			expect(instance.getRanges()[0].from).toBe(1300)
			expect(instance.getRanges()[0].to).toBe(1305)
			expect(instance.getRanges()[0].oldest_time).toBe(990000)
			expect(instance.getRanges()[0].newest_time).toBe(990008)
		})
	})

	describe('database stuff', function() {
		var opts = {resumeMarkersArray: [	{from: 2994, to: 2998, oldest_time: 99960, newest_time: 99986},
											{from: 2894, to: 2898, oldest_time: 98960, newest_time: 98986},
											{from: 2794, to: 2798, oldest_time: 97960, newest_time: 97986}
		]}
		opts.mockDeleteManyFunction = jasmine.createSpy('mockDeleteManyFunction')
		opts.mockInsertManyFunction = jasmine.createSpy('mockInsertManyFunction')

		var mockCollectionService = collectionServiceFactory.get(opts);

		beforeEach(function() {
			spyOn(foo, 'get').and.returnValues(
				{},
				() => { return {normalized: 'tests.BTC-USD'}},
				mockCollectionService
				)
		})

		it('loads records from the database correctly', function() {
			var instance = service(foo.get, foo.set, foo.clear)

			instance.load();

			expect(instance.getRanges().length).toBe(3)
		})

		it('writes changed records correctly', function() {

			var instance = service(foo.get, foo.set, foo.clear)

			instance.load();

			var range = instance.getRanges()[0];

			range.from -= 1;

			instance.flush();

			expect(opts.mockDeleteManyFunction).toHaveBeenCalled()
			expect(opts.mockInsertManyFunction).toHaveBeenCalled()
		})
	})

})