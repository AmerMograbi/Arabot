/*jshint esversion: 6 */

const cache = require('../lib/cache.js');
const messageBuilderTest = require('./message-builder-test.js');
const assert = require('assert');
const database = require('../lib/cache.js');
const should = require('should');
const foreignMovies = "foreignMovies";



describe('Cache', function() {

	describe('#All operations', function() {
		it('should insert shows and then retrieve the first', function() {
			cache.getNextShow("123", foreignMovies, "Fantasy")
				.then(s => {
					console.log("next show is " + s.name);
					cache.getNextShow("123", foreignMovies, "Fantasy")
					.then( s => {
						console.log("next show is " + s.name);
						cache.getNextShow("123", foreignMovies, "Fantasy")
						.then(s => {
							console.log("next show is " + s.name);
							console.log("All Keys: " + JSON.stringify(cache.getAllKeys(), null, 2));
						});
					});
				});
		});
	});
});