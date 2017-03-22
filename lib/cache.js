/*jshint esversion: 6 */

const cachedItemsTtl = 20;//60*60*24;

const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: cachedItemsTtl});

module.exports = {
	get: function(recipientId, chosenShowType, chosenGenre){
		
	}
};
