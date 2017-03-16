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

		// console.log("Received message from user %d and page %d at %d with message:",
		// 	senderID, recipientID, timeOfMessage);
		// console.log(JSON.stringify(message));

		const messageId = message.mid;
		const messageText = message.text;
		const messageAttachments = message.attachments;

		if(message.hasOwnProperty("quick_reply")){
			//it's a quick-reply message
			const quickReplyPayload = message.quick_reply.payload;
			const messageData = messageBuilder.getQuickReplyResponse(quickReplyPayload, senderID);
			return messageData;						
		}else{
			console.log("The message received has no handler.");
			const messageData =  messageBuilder.getTextResponse(senderID, "I didn't understand that.");
			return messageData;
		}

	},


	receivedPostback: function(event) {
		const senderID = event.sender.id;
		const recipientID = event.recipient.id;
		const timeOfPostback = event.timestamp;

		// The 'payload' param is a developer-defined field which is set in a postback 
		// button for Structured Messages. 
		const payload = event.postback.payload;

		// console.log("Received postback for user %d and page %d with payload '%s' " +
		// 	"at %d", senderID, recipientID, payload, timeOfPostback);

		switch (payload) {
			case 'GETTING_STARTED':
				{
					const messageData = messageBuilder.getGettingStartedResponse(senderID);
					return messageData;
				}
			default:
				{
					// Post back was recieved but we didn't know how to handle it

				}
		}
	},

	sendMessage: function(messageData) {
		callSendAPI(messageData);
	}
};


function callSendAPI (messageData) {
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
			throw new Error("Unable to send message. ErrorBody=" + error);
			//console.error(response.body);
		}
	});
}



