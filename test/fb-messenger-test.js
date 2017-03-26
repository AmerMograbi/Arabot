/*jshint esversion: 6 */


const assert = require('assert');
const fbMessenger = require('../lib/fb-messenger');
const should = require('should');
const messageBuilderTest = require('./message-builder-test.js');
const messageBuilder = require('../lib/message-builder.js');
const rewire = require('rewire');
const database = require('../lib/database.js');

const rewiredMessageBuilder = rewire('../lib/message-builder.js');
const buildState = rewiredMessageBuilder.__get__('buildState');
const buildStep = rewiredMessageBuilder.__get__('buildStep');
const buildWillWatchPayload = rewiredMessageBuilder.__get__('buildWillWatchPayload');

const foreignMovies = "foreignMovies";

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
		it('should send a good text message on "willWatch"', function() {
			const msg = fbMessenger.receivedPostback(willWatchPostBackEvent);
			//clean up after ourselves
			database.dropCollection("users");
			//console.log(JSON.stringify(msg, null, 2));
			(() => messageBuilderTest.okQuickReplyStructureTest(msg)).should.not.throw();

		});
		it('should not throw if user sends a text message with no handler', function() {
			const messageToSendBack = fbMessenger.receivedMessage(textMessageEvent);
		});
	});
});

let ShowTypePayload = {
	state: buildState("showTypes", foreignMovies)
};

const quickReplyEventShowType = {
	message: {
		quick_reply: {
			payload: JSON.stringify(ShowTypePayload)
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


let state = buildState("showTypes", foreignMovies);
state.push(buildStep("genres", "Action"));
const payload = {
	state: state
};

const quickReplyEventGenre = {
	message: {
		quick_reply: {
			payload: JSON.stringify(payload)
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
		payload: '{"gettingStarted": ""}'
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
		payload: '{"moreInfo": "This movie is about bla bla..."}'
	},
	sender: {
		id: "123"
	},
	recipient: {
		id: "456"
	},
	timestamp: "789"
};


const willWatchPayload = buildWillWatchPayload("123", "456", foreignMovies);
const willWatchPostBackEvent = {
	postback: {
		payload: JSON.stringify(willWatchPayload)
	},
	sender: {
		id: "123"
	},
	recipient: {
		id: "456"
	},
	timestamp: "789"
};