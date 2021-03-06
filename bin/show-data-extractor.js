/*jshint esversion: 6 */

const fs = require('fs');
var request = require('request');

module.exports = {
	getShowsFromTxtFile: function(filePath, isTurkish) {
		let data = fs.readFileSync(filePath).toString();
		const multipleNewLines = /\n\s*\n/g;
		let showInfo;

		if(isTurkish)
			showInfo = /(?:\n\d*\.\s*)([^\n]+)\s*([^\n\r]+)\s*([^\s\r]+)/g;
		else
			showInfo = /(?:\n\d*.\s*)([^\n]+)\n([^\n\r]+)/g;

		data = data.replace(multipleNewLines, '\n');
		const shows = data.matchAll(showInfo);
		return shows;
	},

	//tmdbShowType={movie, tv}
	addMoreDataFromApi: function(myShows, tmdbShowType) {
		return Promise.all(
			myShows.map(show => addData(show, getShowUrl(show.name, tmdbShowType), tmdbShowType)));
	}
};

String.prototype.matchAll = function(regexp) {
	let shows = [];
	this.replace(regexp, function() {
		let args = [...arguments];
		//remove last two irrelevant args
		args.splice(-2, 2);

		if(args.length == 4){ 
			const turkishImageIdIndex = 3;	
			//add 'shows' arg before turkishImageId
			args.splice(turkishImageIdIndex, 0, shows);
		}else{
			args.push(shows);
		}
		addMatchedToArray.apply(null, args);
	});

	return shows.length ? shows : null;
};

function addMatchedToArray(match, nameAndGenres, description, shows, turkishImageId) {
	const nameRegex = /^[^\(]+/;
	const nameRemoved = nameAndGenres.replace(nameRegex, '');
	const genreDateRegex = /\((\d*)\)\s*-\s*([^\n]+)\r/;
	const genreSeparator = /\s*\+\s*/;

	const name = nameAndGenres.match(nameRegex)[0]
		.replace(/[ \t]*$/, '');

	const releaseDate = nameAndGenres.match(genreDateRegex)[1];
	const genres = nameAndGenres.match(genreDateRegex)[2].split(genreSeparator)
		.map(genre => genre.replace(/\s/g, ''))
		.map(genre => genre.replace(/,/g, '+'));

	let show = {
		"name": name,
		"genres": genres,
		"description": description,
		"releaseDate": releaseDate,
		"imageUrl": turkishImageId + ".jpg"
	};

	shows.push(show);
}



function getShowUrl(showName, tmdbShowType) {
	let url = "https://api.themoviedb.org/3/search/" + tmdbShowType;
	url += "?api_key=" + process.env.TMDB_API_KEY + "&query=" + encodeURIComponent(showName);
	return url;
}

function getJson(url) {
	return new Promise((resolve, reject) => {
		request({
			url: url,
			json: true
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(body);
			} else {
				reject(new Error("Failed getJson on url: " + url + " statusCode: " + response.statusCode));
			}

		});
	});
}


function addData(show, url, tmdbShowType) {
	return new Promise((resolve, reject) => {
		getJson(url).then(body => {
			const firstResult = body.results[0];
			if (firstResult) {
				show.tmdbId = firstResult.id;
				show.releaseDate = firstResult.release_date;
				show.imageUrl = firstResult.backdrop_path;
				getTrailerKey(firstResult.id, tmdbShowType).then(trailerKey => {
					show.trailerKey = trailerKey;
					resolve(show);
				});
			} else {
				reject("Couldn't find " + show.name);
			}
		});
	});
}

function getTrailerKey(showId, tmdbShowType){
	return new Promise((resolve, reject) => {
		let url = "https://api.themoviedb.org/3/" + tmdbShowType + "/" + showId ;
		url += "?api_key=" + process.env.TMDB_API_KEY + "&append_to_response=videos";

		getJson(url).then(body => {
			const firstTrailer = body.videos.results.filter(vid => vid.type == "Trailer")[0];
			resolve(firstTrailer ? firstTrailer.key : "#");
			if(!firstTrailer)
				console.log("Couldn't find trailer for " + showId);
		});
	});
}
