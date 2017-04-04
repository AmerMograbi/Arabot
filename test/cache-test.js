/*jshint esversion: 6 */

const cache = require('../lib/cache.js');
const messageBuilderTest = require('./message-builder-test.js');
const assert = require('assert');
const database = require('../lib/cache.js');
const should = require('should');
const foreignMovies = "foreignMovies";



describe('Cache', function() {

	describe('#All operations', function() {
		it('should get next 3 shows successfully', function() {
			return cache.getNextShow("123", foreignMovies, "Fantasy")
				.then(s => {
					isOkShow(s);
					cache.getNextShow("123", foreignMovies, "Fantasy")
						.then(s => {
							isOkShow(s);
							cache.getNextShow("123", foreignMovies, "Fantasy")
								.then(s => {
									isOkShow(s);
								});
						});
				});
		});
	});
});

function isOkShow(show){
	assert.ok(show.name, "show should have name");
	assert.ok(show.description, "show should have description");
	assert.ok(show.releaseDate, "show should have releaseDate");
	assert.ok(show.trailerKey, "show should have trailerKey");
	assert.ok(show.imageUrl, "show should have imageUrl");
}