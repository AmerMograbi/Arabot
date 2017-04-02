/*jshint esversion: 6 */

const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
let db;

module.exports = {
	findNotLikedShows: function(userId, showType, genres) {
		let shows = db.collection(showType);
		const limit = 10;
		const descending = -1;
		return new Promise((resolve, reject) => {
			getLikedShows(userId, showType, genres)
				.then(liked => {
					const likedObjIds = liked.map(w => new ObjectId(w));
					shows.find({
						"genres": genres,
						"_id": {
							$nin: likedObjIds
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

	addShows: function(collectionName, items) {
		return new Promise((resolve, reject) => {
			let coll = db.collection(collectionName);

			coll.insert(items, function(err, res) {
				if (err) reject(new Error("Failed to insert to db with error: " + err));
				else resolve(res);
			});
		});
	},
	addToLikedList: function(userId, showId, showType, genre) {
		return new Promise((resolve, reject) => {
			let users = db.collection("users");
			const liked = getLikedKey(showType);

			const InsertIfNotFound = {
				upsert: true
			};
			let show = {};
			show[liked + '.genres.' + genre] = showId;

			users.updateOne({
				userId: userId
			}, {
				$addToSet: show
			}, InsertIfNotFound, function(err, res) {
				if (err) reject(new Error("failed to update user: " + userId));
				else {
					resolve(res);
					//console.log("added " + showId + " to liked list");
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

const getLikedKey = showType => showType + "Liked";
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

function getLikedShows(userId, showType, genre) {
	return new Promise((resolve, reject) => {
		const users = db.collection("users");
		const liked = getLikedKey(showType);
		users.findOne({
			userId: userId
		}, function(err, doc) {
			if (err) reject(err);
			else {
				if (!doc || !doc.hasOwnProperty(liked) ||
				 !doc[liked].hasOwnProperty("genres") ||
				 !doc[liked].genres.hasOwnProperty(genre)) {
					resolve([]);
				} else {
					resolve(doc[liked].genres[genre]);
				}
			}


		});
	});
}