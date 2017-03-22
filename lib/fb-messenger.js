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
			const quickReplyPayload = message.quick_reply.payload;
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
		const payload = event.postback.payload;

		if(payload === 'GETTING_STARTED'){
			return messageBuilder.getGettingStartedResponse(senderID);
		}else if(payload.moreInfo){
			return messageBuilder.getMoreInfoResponse(senderID, payload.moreInfo);
		}else if(payload.willWatch){

		}

		console.log("The postback received has no handler.");
		return "";
	},

	sendMessage: function(messageData) {
		callSendAPI(messageData);
	}
};


function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: process.env.VERIFY_TOKEN
		},
		method: 'POST',
		json: messageData

	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			const recipientId = body.recipient_id;
			const messageId = body.message_id;

			console.log("Successfully sent message with id %s to recipient %s",
				messageId, recipientId);
		} else {
			throw new Error("Unable to send message. messageData=" + JSON.stringify(messageData, null, 2));
			//console.error(response.body);
		}
	});
}