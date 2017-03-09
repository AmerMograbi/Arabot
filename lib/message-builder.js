/*jshint esversion: 6 */

const arabicText = require('../arabic-text.json');
const delimiter = "->";

module.exports = {
	getQuickReplyResponse: function(quickReplyPayload, recipientId) {
		const payLoadAsArray = quickReplyPayload.split(delimiter);
		const category = payLoadAsArray[0];
		const chosenFromCategory = payLoadAsArray[1];

		switch (category) {
			case "showTypes":
				{
					return buildQuickReplyMessage(recipientId, "genres");
				}
			default:
				{
					console.log("An unkown category '%s' was found in quickReplyPayload.", category);
				}
		}

	},


	getGettingStartedResponse: function(recipientId) {
		const messageData = buildQuickReplyMessage(recipientId, "showTypes");
		return messageData;
	}
};

function buildQuickReplyMessage(recipientId, category) {
	let quickReplies = [];

	const quickRepliesJson = arabicText[category];
	const suffix = "Text";
	const messageText = arabicText[category + suffix];
	if (!messageText) {
		console.log("The message-text for the '%s' category wasn't found!\nPlease add an entry named '%s' for it.", category, category + suffix);
		return "";
	}

	for (let key in quickRepliesJson) {
		let quickReply = {
			"content_type": "text",
			"title": quickRepliesJson[key],
			"payload": (category + delimiter + key)
		};
		quickReplies.push(quickReply);
	}

	const messageData = {
		"recipient": {
			"id": recipientId
		},
		"message": {
			"text": messageText,
			"quick_replies": quickReplies
		}
	};

	console.log("Built message with data= '%s' for user='%s'.", JSON.stringify(messageData, null, 2), recipientId);
	return messageData;
}


function buildTextMessage(recipientId, messageText) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};

	console.log("Built Text Message with data= '%s' for user='%s'.", JSON.stringify(messageData, null, 2), recipientId);
	return messageData;
}