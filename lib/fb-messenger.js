/*jshint esversion: 6 */

var request = require('request');
const arabicText = require('../arabic-text.json');
const messageBuilder = require('./message-builder.js');

module.exports = {
	receivedMessage: function(event) {
		const senderID = event.sender.id;
		const recipientID = event.recipient.id;
		const timeOfMessage = event.timestamp;

		const message = event.message;
		const messageId = message.mid;
		const messageText = message.text;
		const messageAttachments = message.attachments;

		if (message.hasOwnProperty("quick_reply")) {
			//it's a quick-reply message
			const quickReplyPayload = JSON.parse(message.quick_reply.payload);
			return messageBuilder.getQuickReplyResponse(quickReplyPayload, senderID);
		} else {
			console.log("The message received has no handler.");
			return "";
		}

	},


	receivedPostback: function(event) {
		const senderID = event.sender.id;
		const recipientID = event.recipient.id;
		const timeOfPostback = event.timestamp;
		let payload = JSON.parse(event.postback.payload);

		if (payload.hasOwnProperty("gettingStarted")) {
			return messageBuilder.getGettingStartedResponse(senderID);
		} else if (payload.hasOwnProperty("moreInfo")) {
			return messageBuilder.getMoreInfoResponse(senderID, payload.moreInfo, payload.showId, payload.showType, payload.genre);
		} else if (payload.hasOwnProperty("willWatch")) {
			return messageBuilder.getWillWatchResponse(senderID, payload.willWatch, payload.showType, payload.genre);
		} else if (payload.hasOwnProperty("nextShow")) {
			return messageBuilder.getNextShowResponse(senderID, payload.showType, payload.genre);
		}

		console.log("The postback received has no handler. postback= " + event.postback.payload);
		return "";
	},

	sendMessage: function(messageData) {
		const randomDelay = getRandomIntInclusive(350, 800);
		setTimeout(() => callSendAPI(messageData), randomDelay);
	},

	sendBotTypingStatus: function(recipientId, senderAction) {
		callSendAPI(messageBuilder.getSenderActionResponse(recipientId, senderAction));
	}
};


function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function callSendAPI(messageData) {
	return new Promise((resolve, reject) => {
		request({
			uri: 'https://graph.facebook.com/v2.6/me/messages',
			qs: {
				access_token: process.env.VERIFY_TOKEN
			},
			method: 'POST',
			json: messageData

		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(body);
			} else {
				reject(error);
			}
		});
	});

}