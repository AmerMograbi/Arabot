/*jshint esversion: 6 */

const halfHour = 60*60*0.5;
const cachedItemsTtl = halfHour;
const database = require('./database.js');
const NodeCache = require("node-cache");
const myCache = new NodeCache({
	stdTTL: cachedItemsTtl
});

module.exports = {
	getNextShow: function(recipientId, chosenShowType, chosenGenre) {
		return new Promise((resolve, reject) => {
			const key = createKey(recipientId, chosenShowType, chosenGenre);
			myCache.get(key, function(err, shows) {
				if (!err) {
					if (shows === undefined || shows.length === 0) {
						// key not found or shows array is all used up
						//console.log("miss on key '" + key + "'");
						insertShowsFromDb(recipientId, chosenShowType, chosenGenre)
							.then(nextShow => resolve(nextShow))
							.catch(e => reject(e));
					} else {
						//console.log("hit on key '" + key + "'");
						const nextShow = shows.slice(0, 1)[0];
						shows.splice(0, 1);
						updateShows(key, shows, recipientId, chosenShowType, chosenGenre);
						resolve(nextShow);
					}
				}
			});
		});
	},

	getAllKeys: function() {
		return myCache.keys();
	}
};

function updateShows(key, shows, recipientId, chosenShowType, chosenGenre) {
	//inserting an object with the same key overwrites the prev one
	insertShows(shows, recipientId, chosenShowType, chosenGenre);
}


function insertShowsFromDb(recipientId, chosenShowType, chosenGenre) {
	return new Promise((resolve, reject) => {
		database.findNotSeenShows(recipientId, chosenShowType, chosenGenre)
			.then(showsFound => {
				if (!showsFound.length) {
					reject("NoMoreShows");
				} else {
					const nextShow = showsFound[0];
					showsFound.splice(0, 1);
					insertShows(showsFound, recipientId, chosenShowType, chosenGenre)
						.then(res => resolve(nextShow));
				}
			});
	});
}

function insertShows(showsFound, recipientId, chosenShowType, chosenGenre) {
	return new Promise((resolve, reject) => {
		const key = createKey(recipientId, chosenShowType, chosenGenre);
		myCache.set(key, showsFound, function(err, success) {
			if (!err && success) {
				resolve(success);
			} else {
				reject(err);
			}
		});
	});

}

function createKey(recipientId, chosenShowType, chosenGenre) {
	const d = ',';
	return recipientId + d + chosenShowType + d + chosenGenre;
}