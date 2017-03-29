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
			cache.getNextShow("123", foreignMovies, "Fantasy")
				.then(s => {
					cache.getNextShow("123", foreignMovies, "Fantasy")
						.then(s => {
							cache.getNextShow("123", foreignMovies, "Fantasy")
								.then(s => {});
						});
				});
		});
	});
});