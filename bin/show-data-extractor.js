/*jshint esversion: 6 */

const fs = require('fs');
var request = require('request');

module.exports = {
	getJsonFromTxtFile: function(filePath) {
		let data = fs.readFileSync(filePath).toString();
		const multipleNewLines = /\n\s*\n/g;
		const nameGenreAndDesc = /(?:\n\d*.\s*)([^\n]+)\n([^\n\r]+)/g;

		data = data.replace(multipleNewLines, '\n');
		const shows = data.matchAll(nameGenreAndDesc);
		return shows;
	},

	//showsType={movie, tv}
	addMoreDataFromApi: function(myShows, showsType, apiKey) {
		return Promise.all(
			myShows.map(show => addUrlToshow(show, showsType, apiKey))
			.map(getJsonAndAddData));
	}
};

String.prototype.matchAll = function(regexp) {
	let shows = [];
	this.replace(regexp, function() {
		let args = [...arguments];
		//remove last two irrelevant args
		args.splice(-2, 2);
		args.push(shows);
		addMatchedToArray.apply(null, args);
	});

	return shows.length ? shows : null;
};

function addMatchedToArray(match, nameAndGenres, description, shows) {
	const nameRegex = /^[^\(]+/;
	const nameRemoved = nameAndGenres.replace(nameRegex, '');
	const genreRegex = /(?:\(\d*\))\s*-\s*([^\n]+)\r/;
	const genreSeparator = /\s*\+\s*/;

	const name = nameAndGenres.match(nameRegex)[0]
		.replace(/[ \t]*$/, '');

	const genres = nameAndGenres.match(genreRegex)[1].split(genreSeparator)
		.map(genre => genre.replace(/\s/g, ''))
		.map(genre => genre.replace(/,/g, '+'));

	let show = {
		"name": name,
		"genres": genres,
		"description": description
	};
	shows.push(show);
}



function addUrlToshow(show, showsType, apiKey = process.env.TMDB_API_KEY) {
	const showName = show.name;
	let url = "https://api.themoviedb.org/3/search/" + showsType + "?";
	url += "api_key=" + apiKey + "&query=" + showName.replace(/\s/g, '+');
	show.url = url;
	return show;
}

function getJsonAndAddData(show) {
	return new Promise((resolve, reject) => {
		request({
			url: show.url,
			json: true
		}, function(error, response, body) {

			if (!error && response.statusCode == 200) {
				const firstResult = body.results[0];
				if (firstResult) {
					show.releaseDate = firstResult.release_date;
					show.imageUrl = firstResult.backdrop_path;
				} else {
					console.log("Couldn't find " + show.name);
				}

				delete show.url;
				resolve(show);

			} else {
				let errStr = "Failed with error: " + error + ". response status code: " + response.statusCode;
				errStr += ". url: " + show.url;
				reject(new Error(errStr));
			}

		});
	});

}