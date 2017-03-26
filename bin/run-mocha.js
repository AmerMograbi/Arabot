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


database.init(process.env.MONGODB_LOCAL_URI).then(() => {
		mocha.run(function(failures) {
			process.on('exit', function() {
				process.exit(failures);
			});
		});
	})
	.catch(e => console.log("Something went wrong with err: " + e));
