/*jshint esversion: 6 */

const arabicText = require('./arabic-text.json');
const messageBuilder = require('./lib/message-builder.js');
const fbMessenger = require('./lib/fb-messenger.js');

var msg = messageBuilder.getQuickReplyResponse("foreign movie", 123);

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

//fbMessenger.receivedMessage(event);


