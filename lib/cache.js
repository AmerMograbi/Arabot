/*jshint esversion: 6 */

const threeMinutes = 60 * 3;
const cachedItemsTtl = threeMinutes;
const database = require('./database.js');
const NodeCache = require("node-cache");
const myCache = new NodeCache({
	stdTTL: cachedItemsTtl
});

module.exports = {
	getNextShow: function(recipientId, chosenShowType, chosenGenre) {
		return new Promise((resolve, reject) => {
			const key = createShowKey("showData", recipientId, chosenShowType, chosenGenre);
			let shows = getArray(key);
			if (shows.length > 0) {
				//console.log("hit on key= " + key);
				const nextShow = shows[0];
				shows.splice(0, 1);
				updateShows(key, shows);
				resolve(nextShow);
			} else {
				//console.log("miss on key= " + key);
				const seenShowsInCache = getCachedSeenShows(recipientId, chosenShowType, chosenGenre);
				cacheShowsFromDb(recipientId, chosenShowType, chosenGenre, seenShowsInCache)
					.then(nextShow => resolve(nextShow))
					.catch(e => reject(e));
			}
		});
	},

	getAllKeys: function() {
		return myCache.keys();
	},

	//cache the seen show
	addToSeenList: function(recipientId, showDbId, showType, genre, liked) {
		const key = createShowKey("showSeen", recipientId, showType, genre);
		showDbId = String(showDbId);
		const seenList = getArray(key);
		if (!seenList.includes(showDbId)) {
			seenList.push(showDbId);
			//inserting will update the ttl automatically
			insert(key, seenList);
		}
	}
};

function getCachedSeenShows(recipientId, showType, genre) {
	const aboutToGetShowsFromDbKey = createShowKey("aboutToGetShowsFromDB",
	 recipientId, showType, genre);
	insert(aboutToGetShowsFromDbKey, true, 0);

	const seenShowsKey = createShowKey("showSeen", recipientId, showType, genre);
	let seenShowsInCache = getArray(seenShowsKey);

	if(seenShowsInCache.length === 0){
		const seenShowsTempKey = createShowKey("showSeenTemp", recipientId, showType, genre);
		//if the seenShows key expired but the checkPeriod hasn't fired the 'expired'
		//event yet then we'll get our seenShows from this temp key
		seenShowsInCache = getArray(seenShowsTempKey);
		if(seenShowsInCache.length > 0){
			deleteKey(seenShowsTempKey);
			console.log("Using the temporarily stored seenShows= " + seenShowsInCache);
		}
	}

	deleteKey(aboutToGetShowsFromDbKey);
	return seenShowsInCache;
}

myCache.on("expired", function(key, value) {
	const showKeyObj = JSON.parse(key);

	if (showKeyObj.showSeen) {
		//bulk-add the cached seen shows to the database
		database.addShowsToSeenList(value, showKeyObj.userId, showKeyObj.showType, showKeyObj.genre)
			.then(res => {
				console.log(JSON.stringify(value, null, 2) + "added ");
			});
		handleAboutToGetShowsFromDB(showKeyObj, value);
	}

});

//This function temporarily stores the seenShows in case our key
//has expired but the checkperiod hasn't fired the 'expired' event.
//This way, we can use the seenShows before they get deleted (by
//trying to access them by calling 'get' on the their key).
function handleAboutToGetShowsFromDB(showKeyObj, value){
	const aboutToGetShowsFromDBKey = createShowKey("aboutToGetShowsFromDB",
	 showKeyObj.userId, showKeyObj.showType, showKeyObj.genre);
	if(get(aboutToGetShowsFromDBKey)){
		delete showKeyObj.showSeen;
		showKeyObj.showSeenTemp = true;
		//Temporarily store the seenShows so we can use them in the DB query 
		insert(JSON.stringify(showKeyObj), value, 0);
	}	
}

function deleteKey(key) {
	const value = myCache.del(key);
}


function updateShows(key, shows) {
	//inserting an object with the
	//same key overwrites the prev one
	insert(key, shows);
}


function cacheShowsFromDb(recipientId, chosenShowType, chosenGenre, seenShowsInCache) {
	return new Promise((resolve, reject) => {
		database.findNotSeenShows(recipientId, chosenShowType, chosenGenre, seenShowsInCache)
			.then(showsFound => {
				if (!showsFound.length) {
					reject("NoMoreShows");
				} else {
					const nextShow = showsFound[0];
					showsFound.splice(0, 1);
					const key = createShowKey("showData", recipientId, chosenShowType, chosenGenre);
					insert(key, showsFound);
					resolve(nextShow);
				}
			});
	});
}

function insert(key, val, ttl = cachedItemsTtl) {
	const success = myCache.set(key, val, ttl);
	if (!success) {
		throw new Error("Failed to insert key= " + key + " and val= " + val + "to cache.");
	}
}

//returns undefined if key isn't found
function get(key) {
	return myCache.get(key);
}

function getArray(key){
	const val = myCache.get(key);
	if(!val)
		return [];
	else
		return val;
}

function setTTl(key, ttl) {
	myCache.ttl(key, ttl, function(err, changed) {
		if (!err) {
			//console.log("key= " + key + " changed= " + changed);
		}
	});
}

function createShowKey(field, recipientId, chosenShowType, chosenGenre) {
	let showKeyObj = getShowKeyObj(recipientId, chosenShowType, chosenGenre);
	showKeyObj[field] = true;
	return JSON.stringify(showKeyObj);
}


function getShowKeyObj(recipientId, chosenShowType, chosenGenre) {
	return {
		userId: recipientId,
		showType: chosenShowType,
		genre: chosenGenre
	};
}