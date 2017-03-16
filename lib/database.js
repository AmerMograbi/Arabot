/*jshint esversion: 6 */

let mongoClient = require('mongodb').MongoClient;
let db;

module.exports = {
	findByGenre: function(showType, genres) {
		let shows = db.collection(showType);
		const limit = 3;
		const descending = -1;
		return new Promise((resolve, reject) => {
			shows.find({
				genres: genres
			}).sort({
				releaseDate: descending
			}).limit(limit).toArray(function(err, res) {
				if (err) reject(new Error("Failed to find with error: " + err));
				resolve(res);
			});
		});

	},

	insert: function(showsType, shows) {
		return new Promise((resolve, reject) => {
			let showsCollection = db.collection(showsType);

			showsCollection.insert(shows, function(err, res) {
				if (err) reject(new Error("Failed to insert to db with error: " + err));
				resolve(res);
			});
		});
	},

	init: function(uri = process.env.MONGODB_URI) {
		return new Promise((resolve, reject) => {
			mongoClient.connect(uri, function(err, myDb) {
				if (err) reject(new Error("Failed to connect to db with error: " + err));
				setDb(myDb);
				resolve();
			});
		});

	},

	closeDB: function() {
		db.close();
	},

	getDb: function(){
		return db;
	}
};

function setDb(myDb){
	db = myDb;
}