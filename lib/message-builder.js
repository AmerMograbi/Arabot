/*jshint esversion: 6 */

const arabicText = require('../arabic-text.json');
const delimiter = "->";
const genres = "genres";
const showTypes = "showTypes";
let chosenShowType;

module.exports = {
	getQuickReplyResponse: function(quickReplyPayload, recipientId) {
		const payLoadAsArray = quickReplyPayload.split(delimiter);
		const category = payLoadAsArray[0];

		switch (category) {
			case showTypes:
				{
					chosenShowType = payLoadAsArray[1];
					return buildQuickReplyMessage(recipientId, genres);
				}
			case genres:
				{
					const chosenGenre = payLoadAsArray[1];
					const content = chosenShowType + delimiter + chosenGenre;
					return buildTemplateMessage(recipientId, content);
				}
			default:
				{
					throw new Error("There is no response for the category " + category);
				}
		}

	},


	getGettingStartedResponse: function(recipientId) {
		const messageData = buildQuickReplyMessage(recipientId, showTypes);
		return messageData;
	},

	getDelimiter: function(){
		return delimiter;
	}
};

function buildTemplateMessage(recipientId, content){

}

function buildQuickReplyMessage(recipientId, category) {
	let quickReplies = [];

	if(!recipientId)
		throw new Error("No recipient Id was given.");

	const quickRepliesJson = arabicText[category];
	const suffix = "Text";
	const messageText = arabicText[category + suffix];
	if (!messageText) {
		throw new Error("The message-text for the "+ category +" category wasn't found!");
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

	//console.log("Built message with data= '%s' for user='%s'.", JSON.stringify(messageData, null, 2), recipientId);
	return messageData;
}


function buildTextMessage(recipientId, messageText) {

	if(!messageText)
		throw new Error("Message text is empty.");

	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};

	
	return messageData;
}