/*jshint esversion: 6 */

var request = require('request');
const arabicText = require('../arabic-text.json');
const messageHandler = require('./message-handler.js');

module.exports = {
	receivedMessage: function(event) {
		const senderID = event.sender.id;
		const recipientID = event.recipient.id;
		const timeOfMessage = event.timestamp;
		const message = event.message;

		console.log("Received message from user %d and page %d at %d with message:",
			senderID, recipientID, timeOfMessage);
		console.log(JSON.stringify(message));

		const messageId = message.mid;
		const messageText = message.text;
		const messageAttachments = message.attachments;
		const quickReplyPayload = message.quick_reply.payload;

		//checking if it's a quick_reply message
		if (quickReplyPayload) {
			messageHandler.respondToQuickReply(quickReplyPayload);
		}
	},


	receivedPostback: function(event) {
		const senderID = event.sender.id;
		const recipientID = event.recipient.id;
		const timeOfPostback = event.timestamp;

		// The 'payload' param is a developer-defined field which is set in a postback 
		// button for Structured Messages. 
		const payload = event.postback.payload;

		console.log("Received postback for user %d and page %d with payload '%s' " +
			"at %d", senderID, recipientID, payload, timeOfPostback);

		switch (payload) {
			case 'GETTING_STARTED':
				{
					messageHandler.respondToGettingStarted(senderID);
					break;
				}
			default:
				{
					// When a postback is called, we'll send a message back to the sender to 
					// let them know it was successful
					sendTextMessage(senderID, payload);
				}
		}
	}
};


function sendTextMessage(recipientId, messageText) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};


	callSendAPI(messageData);
}

function sendGenericMessage(recipientId) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					image_aspect_ratio: "square",
					elements: [{
						title: "بويراز كارايل",
						subtitle: "hello there",
						item_url: "http://www.3sk.tv/vb/showthread.php?p=4084966",
						image_url: "https://3sk.tv/art_imgs/148843464120532268.gif",
						buttons: [{
							type: "web_url",
							url: "http://www.3sk.tv/vb/showthread.php?p=4084966",
							title: "Open Web URL"
						}, {
							type: "postback",
							title: "Call Postback",
							payload: "Payload for first bubble",
						}],
					}, {
						title: "touch",
						subtitle: "Your Hands, Now in VR",
						item_url: "https://www.oculus.com/en-us/touch/",
						image_url: "http://3sk.tv/ex/td/pk.png",
						buttons: [{
							type: "web_url",
							url: "https://www.oculus.com/en-us/touch/",
							title: "Open Web URL"
						}, {
							type: "postback",
							title: "Call Postback",
							payload: "Payload for second bubble",
						}]
					}]
				}
			}
		}
	};

	callSendAPI(messageData);
}

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

			console.log("Successfully sent generic message with id %s to recipient %s",
				messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			console.error(response);
			console.error(error);
		}
	});
}