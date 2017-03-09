/*jshint esversion: 6 */

const arabicText = require('./arabic-text.json');
const messageBuilder = require('./lib/message-builder.js');
const fbMessenger = require('./lib/fb-messenger.js');



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
fbMessenger.receivedMessage(mockQuickReplyMessage);
//var msg = messageBuilder.getGettingStartedResponse("123");