/*jshint esversion: 6 */
const showDataExtractor = require('../bin/show-data-extractor.js');
const database = require('../lib/database.js');
const arabicText = require('../arabic-text.json');

let shows;



function add() {
	const showsType = "movie";
	const maxShowNum = 39;
	const filePath = "D:\\gitProjects\\showBot\\bin\\movies.txt";

	shows = showDataExtractor.getJsonFromTxtFile(filePath);
	console.log("adding...");
	showDataExtractor.addMoreDataFromApi(shows.slice(0, maxShowNum), showsType)
		.then(showsWithMoreData => addToDb(showsWithMoreData)) //console.log(showsWithMoreData.length))
		.catch((err) => console.log(err));
}


function dropDb() {
	database.init().then(() => {
			database.getDb().dropDatabase(function(err, res) {
				if (err) {
					console.log("Error: " + err);
				} else {
					console.log("db droped with res: " + res);
				}
			});

		})
		.catch((err) => console.log("Error: " + err));
}

function findInDb(genre) {
	database.init().then(() => {
			database.findByGenre("foreign movies", genre)
				.then(res => console.log(JSON.stringify(res, null, 2) + " length: " + res.length));
		})
		.catch((err) => console.log(err));
}


function addToDb(showsWithMoreData) {
	database.init().then(() => {
			database.insert("foreign movies", showsWithMoreData)
				.then(res => {
					console.log("added " + res.result.n + " objects successfully.");
					shows.splice(0, 39);
					console.log("Number of shows remaining: " + shows.length);
					if (shows.length > 0) {
						setTimeout(add, 13000);
						console.log("waiting 13 seconds...");
					}

				});
		})
		.catch((err) => console.log(err));
}


//example json
//https://api.themoviedb.org/3/search/movie?api_key=c1d387802a440ec1351f3847005cef6a&query=Me+Before+You
//http://image.tmdb.org/t/p/w185//oN5lELHH5Xheiy0YdhnY3JB4hx2.jpg
//where '/oN5lELHH5Xheiy0YdhnY3JB4hx2.jpg' is the poster path
//and w185 is the size