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
		const firstGreeting = "first greeting";
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
		};
		console.log("Built 'getting started' Message with data= '%s' for user='%s'.", JSON.stringify(messageData), recipientId);
		return messageData;
	}
};


function buildTextMessage(recipientId, messageText) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};

	console.log("Built Text Message with data= '%s' for user='%s'.", JSON.stringify(messageData), recipientId);
	return messageData;
}