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
			addTurkishSeries();
			//dropDb();
			//addToWatchedTest();
			//findInDb();		
			//findUser("123");
			//database.dropCollection(turkishSeries).then(res => console.log("collection dropped. res:" + res));
		})
		.catch((err) => console.log(err));
}

function addTurkishSeries() {
	const shows = showDataExtractor.getShowsFromTxtFile(turkishSeriesFilePath, true);
	//console.log(JSON.stringify(shows, null, 2) + " length= " + shows.length);
	database.addShows(turkishSeries, shows)
		.then(res => console.log("added " + res.result.n + " turkish series successfully."));
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

function findInDb(genre, showType) {
	const users = database.getDb().collection("users");
	const mongoUserId = "58d7762acb2c9f12b413284e";
	users.find({
		"_id": new database.ObjectId(mongoUserId)
	}).toArray(function(err, res) {
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


function addToWatchedTest() {
	database.addToWatchedList("123", "62361421262", foreignMovies, "Action");
	database.addToWatchedList("123", "68853", foreignMovies, "Comedy");
	database.addToWatchedList("123", "3523", "turkishSeries", "Drama");
	database.addToWatchedList("123", "125415", "turkishSeries", "Drama");
	database.addToWatchedList("123", "125415", "turkishSeries", "Adventure");
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


//example json
//https://api.themoviedb.org/3/search/movie?api_key=c1d387802a440ec1351f3847005cef6a&query=Me+Before+You
//http://image.tmdb.org/t/p/w185//oN5lELHH5Xheiy0YdhnY3JB4hx2.jpg
//where '/oN5lELHH5Xheiy0YdhnY3JB4hx2.jpg' is the poster path

//http://image.tmdb.org/t/p/w500//o4lxNwKJz8oq3R0kLOIsDlHbDhZ.jpg

//http://api.themoviedb.org/3/movie/296096?api_key=c1d387802a440ec1351f3847005cef6a&append_to_response=videos

//and w185 is the size