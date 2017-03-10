/*jshint esversion: 6 */

let mongoClient = require('mongodb').MongoClient;
let db;

module.exports = {
	find: function(showType, genres){
		let shows = db.collection(showType);
		const limit = 10;
		const descending = -1;

		shows.find({genres: genres}).sort({releaseDate: descending}).limit(limit).toArray(function (err, docs){
			closeDB(db);
			if(err || (docs.length <= 0) ) throw err;
			console.log("returned: '%s'", JSON.stringify(docs[0]));
			return docs[0];
		});


	},

	insert: function(showType, item){
		let shows = db.collection(showType);
		
		shows.insert(item, function(err, result) {
			if(err) throw err;
			console.log("Item was inserted successfully.");
		});
	},

	remove: function(collection, itemId){

	},

	init: function(){
		mongoClient.connect(process.env.MONGODB_URI, function(err, database) {
			if(err) throw err;
			console.log("Successfully connected to the database.");
			db = database;
		});	
	}
};




function closeDB(db){
	db.close(function (err) {
      if(err) throw err;
      console.log("db closed");
	});	
}







