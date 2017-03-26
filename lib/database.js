/*jshint esversion: 6 */

const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
let db;

module.exports = {
	findByGenre: function(showType, genres) {
		let shows = db.collection(showType);
		const limit = 10;
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

	addShow: function(collectionName, items) {
		return new Promise((resolve, reject) => {
			let coll = db.collection(collectionName);

			coll.insert(items, function(err, res) {
				if (err) reject(new Error("Failed to insert to db with error: " + err));
				resolve(res);
			});
		});
	},

	addToWatchedList: function(userId, showId, showType) {
		return new Promise((resolve, reject) => {
			let users = db.collection("users");

			users.findOne({
				userId: userId
			}, function(err, user) {
				if (err) reject(new Error("Failed to get user: " + user));
				const watched = showType + "Watched";
				const userObject = {
					userId: userId,
					[watched]: [showId]
				};
				if (!user) { //no user found
					insert("users", userObject)
						.then(res => resolve(res))
						.catch(e => reject(new Error(e)));
				} else {
					users.updateOne({
						userId: userId
					}, {
						$addToSet: {
							[watched]: showId
						}
					}, function(err, res) {
						if (err) reject(new Error("failed to update user: " + userId));
						resolve(res);
					});
				}

			});
		});
	},

	init: function(uri) {
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

	getDb: function() {
		return db;
	},

	dropCollection: function(collectionName) {
		return new Promise((resolve, reject) => {
			db.collection(collectionName).drop(function(err, response) {
				if(err) reject(err);
				resolve(response);
			});
		});

	},

	ObjectId: ObjectId
};


function insert(collectionName, items) {
	return new Promise((resolve, reject) => {
		let coll = db.collection(collectionName);

		coll.insert(items, function(err, res) {
			if (err) reject(new Error("Failed to insert to db with error: " + err));
			resolve(res);
		});
	});
}

function setDb(myDb) {
	db = myDb;
}