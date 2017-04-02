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
			return messageBuilder.getGettingStartedResponse(senderID);
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
		} else if (payload.hasOwnProperty("liked")) {
			return messageBuilder.getLikedResponse(senderID, payload.liked, payload.showType, payload.genre);
		} else if (payload.hasOwnProperty("nextShow")) {
			return messageBuilder.getNextShowResponse(senderID, payload.showType, payload.genre, payload.currShowId);
		} else if (payload.hasOwnProperty("startOver")) {
			return messageBuilder.getNextShowResponse(senderID, payload.showType, payload.genre, payload.currShowId);
		}

		console.log("The postback received has no handler. postback= " + event.postback.payload);
		return "";//messageBuilder.getTextResponse(senderID, "Sorry, didn't get that.");
	},

	sendMessage: function(messageData) {
		return callSendAPI(messageData);
	},

	sendBotTypingStatus: function(recipientId, senderAction) {
		callSendAPI(messageBuilder.getSenderActionResponse(recipientId, senderAction));
	}
};


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