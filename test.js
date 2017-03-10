/*jshint esversion: 6 */

const arabicText = require('./arabic-text.json');
const messageBuilder = require('./lib/message-builder.js');
const fbMessenger = require('./lib/fb-messenger.js');
const db = require('./lib/database.js');



const movie = [
  {
  	name: "Dear John",
    releaseDate: "2010-06-22",
    genres: "romance drama",
    description: "يسرد الفيلم قصة حب جندي أمريكي وفتاة جامعية محافظة، ينقل لنا الفيلم لحظات حب جميلة ورسائل مفعمة بالأحاسيس بين الاثنين، لكن أحداث 11\9 تهدد استقرار العلاقة!"
  }
];


const mockQuickReplyMessage = {
	message: {
		quick_reply: {
			payload: "showTypes->foreign series"
		},
		text: "hello"
	},
	sender: {
		id: "123"
	},
	recipient: {
		id: "456"
	},
	timestamp: "789"

};

const mockTextMessage = {
	message: {
		text: "yo foo"
	},
	sender: {
		id: "123"
	},
	recipient: {
		id: "456"
	},
	timestamp: "789"

};

//var msg = messageBuilder.getQuickReplyResponse("showTypes-foreign movie", 123);
//var msg = messageBuilder.getQuickReplyResponse("showTypes->foreign movie", 123);
//fbMessenger.receivedMessage(mockQuickReplyMessage);
//var msg = messageBuilder.getGettingStartedResponse("123");


try{
	//db.insert("foreign_movies",movie);	
	db.find("foreign_movies", "romance drama");
} catch (e){
	console.log("db action failed. Error= %s", e);
}

