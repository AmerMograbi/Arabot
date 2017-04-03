/*jshint esversion: 6 */

//CHANGE TO 3 MINUTES AFTER TESTING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const threeMinutes = 10;//60 * 3;
const cachedItemsTtl = threeMinutes;
const database = require('./database.js');
const NodeCache = require("node-cache");
const myCache = new NodeCache({
	stdTTL: cachedItemsTtl
});

module.exports = {
	getNextShow: function(recipientId, chosenShowType, chosenGenre) {
		return new Promise((resolve, reject) => {
			const key = createShowDataKey(recipientId, chosenShowType, chosenGenre);
			get(key).then(shows => {
				//console.log("hit on key= " + key);
				const nextShow = shows[0];
				shows.splice(0, 1);
				updateShows(key, shows);
				resolve(nextShow);
			})
			.catch(e => {
				if(e == "KeyNotFound"){
					//console.log("miss on key= " + key);
					insertShowsFromDb(recipientId, chosenShowType, chosenGenre)
					.then(nextShow => resolve(nextShow))
					.catch(e => reject(e));
				}else{
					reject(e);
				}
			});
		});
	},

	getAllKeys: function() {
		return myCache.keys();
	},

	//cache the seen show
	addToSeenList: function(recipientId, showDbId, showType, genre, liked) {
		const key = createShowSeenKey(recipientId, showType, genre);
		showDbId = String(showDbId);
		get(key).then(seenList => {
			if(!seenList.includes(showDbId)){
				seenList.push(showDbId);
				//inserting will update the ttl automatically
				insert(key, seenList);
				console.log("seenList= " + seenList);
			}
		}).catch(e => {
			if(e == "KeyNotFound"){
				insert(key, [showDbId]);
				console.log("created seenList with one show= " + showDbId);
			}
		});
	}
};

myCache.on("expired", function(key, value) {
	const showKeyObj = JSON.parse(key);

	if(showKeyObj.showSeen){
		//bulk-add the cached seen shows to the database
		console.log("seenList= " + value);
		database.addShowsToSeenList(value, showKeyObj.userId, showKeyObj.showType, showKeyObj.genre)
		.then(res => {
			console.log(JSON.stringify(value, null, 2) + "added " + res.result.n + " shows");
		});
	}

});


function updateShows(key, shows) {
	//inserting an object with the
	//same key overwrites the prev one
	insert(key, shows);
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
					const key = createShowDataKey(recipientId, chosenShowType, chosenGenre);
					insert(key, showsFound)
						.then(res => resolve(nextShow));
				}
			});
	});
}

function insert(key, val) {
	return new Promise((resolve, reject) => {
		myCache.set(key, val, function(err, success) {
			if (!err && success) {
				resolve(success);
			} else {
				reject(err);
			}
		});
	});
}

function get(key){
	return new Promise((resolve, reject) => {
		myCache.get(key, function( err, shows ){
		  if( !err ){
		    if(shows === undefined || shows.length === 0){
		      reject("KeyNotFound");
		    }else{
			  resolve(shows);
		    }
		  }
		});		
	});

}

function setTTl(key, ttl) {
	myCache.ttl(key, ttl, function(err, changed) {
		if (!err) {
			console.log("key= " + key +" changed= " + changed);
		}
	});
}

function createShowDataKey(recipientId, chosenShowType, chosenGenre) {
	let showKeyObj = getShowKeyObj(recipientId, chosenShowType, chosenGenre);
	showKeyObj.showData = true;
	return JSON.stringify(showKeyObj);
}

function createShowSeenKey(recipientId, chosenShowType, chosenGenre) {
	let showKeyObj = getShowKeyObj(recipientId, chosenShowType, chosenGenre);
	showKeyObj.showSeen = true;
	return JSON.stringify(showKeyObj);	
}

function getShowKeyObj(recipientId, chosenShowType, chosenGenre){
	return {
		userId: recipientId,
		showType: chosenShowType,
		genre: chosenGenre
	};	
}