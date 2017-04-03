/*jshint esversion: 6 */
const showDataExtractor = require('../bin/show-data-extractor.js');
const database = require('../lib/database.js');
const arabicText = require('../arabic-text.json');
const filePath = "D:\\gitProjects\\showBot\\bin\\movies.txt";
const turkishSeriesFilePath = "D:\\gitProjects\\showBot\\bin\\turkishSeries.txt";
const maxShowNum = 19;
const foreignMovies = "foreignMovies";
const turkishSeries = "turkishSeries";


run();


function run() {
	database.init(process.env.MONGODB_LOCAL_URI).then(() => {
			//add(showDataExtractor.getShowsFromTxtFile(filePath), foreignMovies, "movie");
			//addTurkishSeries();
			//dropDb();
			//addToSeenTest();
			//printUsers();		
			//findUser("123");
			//printAllInCollection(turkishSeries);
			//database.dropCollection("users").then(res => console.log("collection dropped. res:" + res));
		})
		.catch((err) => console.log(err));
}

function addTurkishSeries() {
	const shows = showDataExtractor.getShowsFromTxtFile(turkishSeriesFilePath, true);
	//console.log(JSON.stringify(shows, null, 2) + " length= " + shows.length);
	database.addShows(turkishSeries, shows)
		.then(res => console.log("added " + res.result.n + " turkish series successfully."));
}

function printAllInCollection(showType){
	database.getAllInCollection(turkishSeries)
	.then(items => console.log(JSON.stringify(items, null, 2) + "items.length= " + items.length));
}


function add(shows, showType, tmdbShowType) {
	console.log("adding...");
	showDataExtractor.addMoreDataFromApi(shows.slice(0, maxShowNum), tmdbShowType)
		.then(showsWithMoreData => addToDbWithDelay(showsWithMoreData, shows, showType, tmdbShowType)) //console.log(showsWithMoreData))
		.catch((err) => console.log(err));
}


function dropDb() {
	database.getDb().dropDatabase(function(err, res) {
		if (err) {
			console.log("Error: " + err);
		} else {
			console.log("db droped with res: " + res);
		}
	});
}


function cursorTest(showType) {
	const movies = database.getDb().collection(showType);
	var cursor = movies.find({});

	cursor.nextObject(function(err, item) {
		console.log(cursor);
	});
}

function printUsers(genre, showType) {
	const users = database.getDb().collection("users");
	users.find({}).toArray(function(err, res) {
		if (err) throw new Error(err);
		console.log(JSON.stringify(res, null, 2));
	});
}

function findUser(userId) {
	const users = database.getDb().collection("users");
	users.find({
		"userId": userId
	}).toArray(function(err, res) {
		if (err) throw new Error(err);
		console.log(JSON.stringify(res, null, 2));
	});
}


function addToSeenTest() {
	database.addToSeenList("123", "62361421262", foreignMovies, "Action");
	database.addToSeenList("123", "68853", foreignMovies, "Comedy");
	database.addToSeenList("123", "3523", "turkishSeries", "Drama");
	database.addToSeenList("123", "125415", "turkishSeries", "Drama");
	database.addToSeenList("123", "125415", "turkishSeries", "Adventure");
}


function addToDbWithDelay(showsWithMoreData, shows, showType, tmdbShowType) {
	database.addShows(showType, showsWithMoreData)
		.then(res => {
			console.log("added " + res.result.n + " objects successfully.");
			shows.splice(0, maxShowNum);
			console.log("Number of shows remaining: " + shows.length);
			if (shows.length > 0) {
				setTimeout(() => add(shows, showType, tmdbShowType), 13000);
				console.log("waiting 13 seconds...");
			} else {
				console.log("All Done!");
			}

		});
}