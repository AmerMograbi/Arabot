/*jshint esversion: 6 */


const assert = require('assert');
const fbMessenger = require('../lib/fb-messenger');
const should = require('should');
const messageBuilderTest = require('./message-builder-test.js');


const quickReplyEventMessage = {
	message: {
		quick_reply: {
			payload: "showTypes->foreign series"
		},
		text: "hello"
	},
	sender: {
		id: "123"
	},
	recipient: {
		id: "456"
	},
	timestamp: "789"
};

const gettingStartedPostBackEvent = {
	postback: {
		payload: "GETTING_STARTED",
	},
	sender: {
		id: "123"
	},
	recipient: {
		id: "456"
	},
	timestamp: "789"
};

describe('FbMessenger', function() {
	describe('#ChatBot conversation', function() {

		it('should send a good quick-reply on GETTING_STARTED postback', function() {
			const messageToSendBack = fbMessenger.receivedPostback(gettingStartedPostBackEvent);
			messageBuilderTest.okQuickReplyStructureTest(messageToSendBack);
		});
		it('should send a good quick-reply after the user chose a show type', function() {
			const messageToSendBack = fbMessenger.receivedMessage(quickReplyEventMessage);
			messageBuilderTest.okQuickReplyStructureTest(messageToSendBack);
		});
	});
});

