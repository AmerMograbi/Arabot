/*jshint esversion: 6 */

const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
let db;

module.exports = {
	findNotSeenShows: function(userId, showType, genres) {
		let shows = db.collection(showType);
		const limit = 10;
		const descending = -1;
		return new Promise((resolve, reject) => {
			getSeenShows(userId, showType, genres)
				.then(seen => {
					const seenObjIds = seen.map(w => new ObjectId(w));
					shows.find({
						"genres": genres,
						"_id": {
							$nin: seenObjIds
						}
					}).sort({
						releaseDate: descending
					}).limit(limit).toArray(function(err, res) {
						if (err) reject(new Error("Failed to find in db with error: " + err));
						else resolve(res);
					});
				});
		});

	},

	addShows: function(collectionName, items) {
		return new Promise((resolve, reject) => {
			let coll = db.collection(collectionName);

			coll.insert(items, function(err, res) {
				if (err) reject(new Error("Failed to insert to db with error: " + err));
				else resolve(res);
			});
		});
	},

	addShowsToSeenList: function(shows, userId, showType, genre) {
		return new Promise((resolve, reject) => {
			let users = db.collection("users");
			const seen = getSeenKey(showType);

			const InsertIfNotFound = {
				upsert: true
			};
			let showsObj = {};
			showsObj[seen + '.genres.' + genre] = { $each: shows };

			users.updateOne({
				userId: userId
			}, {
				$addToSet: showsObj
			}, InsertIfNotFound, function(err, res) {
				if (err) reject(new Error("failed to update seenList of user: " + userId));
				else {
					resolve(res);
					//console.log("added " + showId + " to seen list");
				}
			});
		});
	},

	init: function(uri) {
		return new Promise((resolve, reject) => {
			mongoClient.connect(uri, function(err, myDb) {
				if (err) reject(new Error("Failed to connect to db with error: " + err));
				else {
					setDb(myDb);
					resolve();
				}

			});
		});

	},

	closeDB: () => db.close(),
	getDb: () => db,

	dropCollection: function(collectionName) {
		return new Promise((resolve, reject) => {
			db.collection(collectionName).drop(function(err, response) {
				if (err) reject(err);
				else resolve(response);
			});
		});

	},

	getAllInCollection: function(collection) {
		return new Promise((resolve, reject) => {
			let shows = db.collection(collection);
			shows.find({}).toArray(function(err, res) {
				if (err) reject(new Error("Failed to find in db with error: " + err));
				else resolve(res);
			});
		});
	},

	ObjectId: ObjectId
};

const getSeenKey = showType => showType + "Seen";
const setDb = myDb => db = myDb;

function insert(collectionName, items) {
	return new Promise((resolve, reject) => {
		let coll = db.collection(collectionName);

		coll.insert(items, function(err, res) {
			if (err) reject(new Error("Failed to insert to db with error: " + err));
			else resolve(res);
		});
	});
}

function getSeenShows(userId, showType, genre) {
	return new Promise((resolve, reject) => {
		const users = db.collection("users");
		const seen = getSeenKey(showType);
		users.findOne({
			userId: userId
		}, function(err, doc) {
			if (err) reject(err);
			else {
				if (!doc || !doc.hasOwnProperty(seen) ||
					!doc[seen].hasOwnProperty("genres") ||
					!doc[seen].genres.hasOwnProperty(genre)) {
					resolve([]);
				} else {
					resolve(doc[seen].genres[genre]);
				}
			}


		});
	});
}