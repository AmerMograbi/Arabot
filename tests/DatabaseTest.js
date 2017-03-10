/*jshint esversion: 6 */

const Test = require('./test.js');
const assert = require('assert');
const messageBuilder = require('../lib/database.js');


class DatabaseTest extends Test{
	insertTest(){
		assert.ok("1");
	}
}

let dbTest = new DatabaseTest();

module.exports = dbTest;