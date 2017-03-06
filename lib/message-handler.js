/*jshint esversion: 6 */

const messageHandler = require('./fb-messenger.js');
const arabicText = require('../arabic-text.json');

module.exports = {
	respondToQuickReply: function(quickReplyPayload) {
		const stage = {
			"foreign movie": "1",
			"foreign series": "1",
			"turkish series": "1"
		};
		if (stage[quickReplyPayload]) {
			sendTextMessage(senderID, arabicText["what to watch"]);
		} else {
			console.log("quickReplyPayload= '%s'", quickReplyPayload);
		}
		console.log("messageText= '%s'", messageText);
	},
	respondToGettingStarted: function(recipientId) {
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
		callSendAPI(messageData);
	}
};