/*jshint esversion: 6 */

const arabicText = require('./arabic-text.json');
const messageBuilder = require('./lib/message-builder.js');
const fbMessenger = require('./lib/fb-messenger.js');



const event = {
	message:{
		quick_reply: {
			payload: "foreign movie"
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

//var msg = messageBuilder.getQuickReplyResponse("foreign movie", 123);
//fbMessenger.receivedMessage(event);
var msg = messageBuilder.getGettingStartedResponse("123");



