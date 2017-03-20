/*jshint esversion: 6 */


const assert = require('assert');
const database = require('../lib/database.js');
const should = require('should');


const movie = [{
	name: "Dear John",
	releaseDate: "2010-06-22",
	genres: "romance drama",
	description: "يسرد الفيلم قصة حب جندي أمريكي وفتاة جامعية محافظة، ينقل لنا الفيلم لحظات حب جميلة ورسائل مفعمة بالأحاسيس بين الاثنين، لكن أحداث 11\9 تهدد استقرار العلاقة!"
}];

//don't modify the DB unless you connect ot the localhost one!!

/*describe('Database', function() {

	it('should succeed in all database operations', function(done) {
		database.init(function(err, db) {
			insertAndFindTest(db, done);
		}, "mongodb://127.0.0.1:27017");
	});
});

function insertAndFindTest(db, done) {
	database.insert(db, "foreign movie", movie, function(err, res) {
		if (err) done(err);
		database.find(db, "foreign movie", "romance drama", function(err, docs) {
			if (err) done(error);

			db.collection("foreign movie").drop(function(err, response) {
				if (err) done(error);
			});

			database.closeDB(db);
			done();
		});

	});
}*/