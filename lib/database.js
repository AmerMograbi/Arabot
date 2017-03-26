/*jshint esversion: 6 */

const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
let db;

module.exports = {
	findNotWatchedShows: function(userId, showType, genres) {
		let shows = db.collection(showType);
		const limit = 10;
		const descending = -1;
		return new Promise((resolve, reject) => {
			getWatchedShows(userId, showType, genres)
				.then(watched => {
					//problem is here
					console.log(watched);
					const watchedObjIds = watched.map(w => String(w))
					.map(w => new ObjectId(w));
					shows.find({
						"genres": genres,
						"_id": {
							$nin: watchedObjIds
						}
					}).sort({
						releaseDate: descending
					}).limit(limit).toArray(function(err, res) {
						if (err) reject(new Error("Failed to find with error: " + err));
						else resolve(res);
					});
				});
		});

	},

	addShow: function(collectionName, items) {
		return new Promise((resolve, reject) => {
			let coll = db.collection(collectionName);

			coll.insert(items, function(err, res) {
				if (err) reject(new Error("Failed to insert to db with error: " + err));
				else resolve(res);
			});
		});
	},
	addToWatchedList: function(userId, showId, showType, genre) {
		return new Promise((resolve, reject) => {
			let users = db.collection("users");
			const watched = getWatchedKey(showType);

			const InsertIfNotFound = {
				upsert: true
			};
			let show = {};
			show[watched + '.genres.' + genre] = showId;

			users.updateOne({
				userId: userId
			}, {
				$addToSet: show
			}, InsertIfNotFound, function(err, res) {
				if (err) reject(new Error("failed to update user: " + userId));
				else {
					resolve(res);
					console.log("added " + showId + " to watched list");
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

	ObjectId: ObjectId
};

const getWatchedKey = showType => showType + "Watched";
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

function getWatchedShows(userId, showType, genre) {
	return new Promise((resolve, reject) => {
		const users = db.collection("users");
		const watched = getWatchedKey(showType);
		users.findOne({
			userId: userId
		}, function(err, doc) {
			if (err) reject(err);
			else {
				if (!doc || !doc.hasOwnProperty(watched) || !doc[watched].genres.hasOwnProperty(genre)) {
					console.log("got EMPTY watched list. doc= " + JSON.stringify(doc, null, 2));
					console.log("was looking for doc." + watched + ".genres." + genre);
					resolve([]);
				} else {
					console.log("got watched list: " + JSON.stringify(doc[watched].genres[genre], null, 2) + "doc= " + JSON.stringify(doc, null, 2));
					resolve(doc[watched].genres[genre]);
				}
			}


		});
	});
}