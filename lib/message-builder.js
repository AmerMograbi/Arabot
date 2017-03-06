/*jshint esversion: 6 */

const arabicText = require('../arabic-text.json');

module.exports = {
	getQuickReplyResponse: function(quickReplyPayload, recipientId) {
		const stage = {
			"foreign movie": "1",
			"foreign series": "1",
			"turkish series": "1"
		};
		if (stage[quickReplyPayload]) {
			return buildTextMessage(recipientId, arabicText["what to watch"]);
		} else {
			console.log("quickReplyPayload= '%s'", quickReplyPayload);
		}
	},


	getGettingStartedResponse: function(recipientId) {
		/*const firstGreeting = "first greeting";
		const foreignMovie = "foreign movie";
		const foreignSeries = "foreign series";
		const turkishSeries = "turkish series";

		const messageData = {
			"recipient": {
				"id": recipientId
			},
			"message": {
				"text": arabicText[firstGreeting],
				"quick_replies": [{
					"content_type": "text",
					"title": arabicText[foreignMovie],
					"payload": foreignMovie
				}, {
					"content_type": "text",
					"title": arabicText[foreignSeries],
					"payload": foreignSeries
				}, {
					"content_type": "text",
					"title": arabicText[turkishSeries],
					"payload": turkishSeries
				}]
			}
		};*/
		const messageData = buildQuickReplyMessage(recipientId, "showTypes");
		return messageData;
	}
};

function buildQuickReplyMessage(recipientId, content) {
	let quickReplies =[];

	let quickRepliesJson = arabicText[content];
	let messageText = arabicText[content + "Text"];

	for (let key in quickRepliesJson){
		let quickReply = {
			"content_type": "text",
			"title": quickRepliesJson[key],
			"payload": key
		};
		quickReplies.push(quickReply);
	}

	const messageData = {
		"recipient": {
			"id": recipientId
		},
		"message": {
			"text": messageText,	
			"quick_replies":quickReplies
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