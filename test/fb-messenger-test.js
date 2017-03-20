/*jshint esversion: 6 */


const assert = require('assert');
const fbMessenger = require('../lib/fb-messenger');
const should = require('should');
const messageBuilderTest = require('./message-builder-test.js');
const messageBuilder = require('../lib/message-builder.js');

const keyValDelimiter = messageBuilder.getkeyValDelimiter();
const delimiter = messageBuilder.getDelimiter();


describe('FbMessenger', function() {
	describe('#ChatBot conversation', function() {

		it('should send a good quick-reply on GETTING_STARTED postback', function() {
			const messageToSendBack = fbMessenger.receivedPostback(gettingStartedPostBackEvent);
			messageBuilderTest.okQuickReplyStructureTest(messageToSendBack);
		});
		it('should send a good quick-reply on showType choose ', function() {
			const messageToSendBack = fbMessenger.receivedMessage(quickReplyEventShowType);
			messageBuilderTest.okQuickReplyStructureTest(messageToSendBack);
		});
		it('should send a good generic template on genre choose', function() {
			//just in order to simulate a user picking a show type
			fbMessenger.receivedMessage(quickReplyEventShowType);
			const messageToSendBack = fbMessenger.receivedMessage(quickReplyEventGenre);
			return messageToSendBack
				.then(msg => {
					(() => messageBuilderTest.okGenericTemplateStructureTest(msg)).should.not.throw();
				});
		});
		it('should send a good button template on "moreInfo"', function() {
			const msg = fbMessenger.receivedPostback(moreInfoPostBackEvent);
			(() => messageBuilderTest.okButtonTemplateStructureTest(msg)).should.not.throw();	
		});
		it('should not throw if user sends a text message with no handler', function() {
			const messageToSendBack = fbMessenger.receivedMessage(textMessageEvent);
		});
	});
});

const quickReplyEventShowType = {
	message: {
		quick_reply: {
			payload: "showTypes" +keyValDelimiter+ "foreign movies"
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

const quickReplyEventGenre = {
	message: {
		quick_reply: {
			payload: "showTypes" +keyValDelimiter+ "foreign movies" +delimiter+ "genres" +keyValDelimiter+ "Action"
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

const textMessageEvent = {
	message: {
		text: "hello",
	},
	sender: {
		id: "123"
	},
	recipient: {
		id: "456"
	},
	timestamp: "789"
};

const moreInfoPostBackEvent = {
	postback: {
		payload: "moreInfo" + keyValDelimiter + "This movie is about bla bla...",
	},
	sender: {
		id: "123"
	},
	recipient: {
		id: "456"
	},
	timestamp: "789"
};