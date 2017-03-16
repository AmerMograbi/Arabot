/*jshint esversion: 6 */

const database = require('../lib/database.js');

let Mocha = require('mocha'),
	fs = require('fs'),
	path = require('path');

// Instantiate a Mocha instance.
let mocha = new Mocha();

let testDir = 'test';

fs.readdirSync(testDir).filter(function(file) {
	// Only keep the .js files
	return file.substr(-3) === '.js';

}).forEach(function(file) {
	mocha.addFile(
		path.join(testDir, file)
	);
});



database.init().then(() => {
		mocha.run(function(failures) {
				process.on('exit', function() {
					process.exit(failures);
				});
			})
			.on('fail', function(test, err) {
				//console.log('Test fail');
				//console.log("title of failed test: " + test.title);
				//console.log(err);
				//const stackTrace = test.err.stack;
				//console.log("stackTrace: " + stackTrace);
			});
	})
	.catch(e => console.log("Something went wrong with err: " + e));

// Run the tests.