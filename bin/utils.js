/*jshint esversion: 6 */
const showDataExtractor = require('../bin/show-data-extractor.js');
const database = require('../lib/database.js');
const arabicText = require('../arabic-text.json');
const filePath = "D:\\gitProjects\\showBot\\bin\\movies.txt";

add(showDataExtractor.getJsonFromTxtFile(filePath));

//dropDb();

function add(shows) {
	const movie = "movie";
	const maxShowNum = 39;
	
	console.log("adding...");
	showDataExtractor.addMoreDataFromApi(shows.slice(0, maxShowNum), movie)
		.then(showsWithMoreData => addToDb(showsWithMoreData, shows))//console.log(showsWithMoreData.length)) 
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


function addToDb(showsWithMoreData, shows) {
	database.init().then(() => {
			database.insert("foreign movies", showsWithMoreData)
				.then(res => {
					console.log("added " + res.result.n + " objects successfully.");
					shows.splice(0, 39);
					console.log("Number of shows remaining: " + shows.length);
					if (shows.length > 0) {
						setTimeout(()=>add(shows), 13000);
						console.log("waiting 13 seconds...");
					}else{
						console.log("All Done!");
					}

				});
		})
		.catch((err) => console.log(err));
}


//example json
//https://api.themoviedb.org/3/search/movie?api_key=c1d387802a440ec1351f3847005cef6a&query=Me+Before+You
//http://image.tmdb.org/t/p/w185//oN5lELHH5Xheiy0YdhnY3JB4hx2.jpg
//where '/oN5lELHH5Xheiy0YdhnY3JB4hx2.jpg' is the poster path

//http://image.tmdb.org/t/p/w342//o4lxNwKJz8oq3R0kLOIsDlHbDhZ.jpg

//and w185 is the size