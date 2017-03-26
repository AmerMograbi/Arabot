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
const buildNextShowPayload = rewiredMessageBuilder.__get__('buildNextShowPayload');

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
					console.log(JSON.stringify(msg, null, 2));
					(() => messageBuilderTest.okGenericTemplateStructureTest(msg)).should.not.throw();
				});
		});
		it('should send a good button template on "moreInfo"', function() {
			const msg = fbMessenger.receivedPostback(moreInfoPostBackEvent);
			(() => messageBuilderTest.okButtonTemplateStructureTest(msg)).should.not.throw();
		});
		it('should send a good quick-reply message on "willWatch"', function() {
			const msg = fbMessenger.receivedPostback(willWatchPostBackEvent);
			//clean up after ourselves
			database.dropCollection("users");
			(() => messageBuilderTest.okQuickReplyStructureTest(msg)).should.not.throw();
		});
		it('should send the next show on "nextShow"', function() {
			const messageToSendBack = fbMessenger.receivedPostback(NextShowPostBackEvent);
			return messageToSendBack
					.then(msg => {
					//console.log(JSON.stringify(msg, null, 2));
					(() => messageBuilderTest.okGenericTemplateStructureTest(msg)).should.not.throw();
				});
		});
		it('should send a good quick-reply message on "startOver"', function() {
			const messageToSendBack = fbMessenger.receivedMessage(quickReplyEventstartOver);
			messageBuilderTest.okQuickReplyStructureTest(messageToSendBack);
		});
		it('should not throw if user sends a message with no handler', function() {
			const messageToSendBack = fbMessenger.receivedMessage(textMessageEvent);
		});
	});
});

let ShowTypePayload = {
	state: buildState("showTypes", foreignMovies)
};

//create a builder function for these!!!!!!!
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

let startOverPayload = {
	state: buildState("willWatchResponse", "startOver")
};

const quickReplyEventstartOver = {
	message: {
		quick_reply: {
			payload: JSON.stringify(startOverPayload)
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


const willWatchPayload = buildWillWatchPayload("58d7803f0a6747036c7d5ee6", foreignMovies, "Children");
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

const NextShowPayload = buildNextShowPayload(foreignMovies, "Children");
const NextShowPostBackEvent = {
	postback: {
		payload: JSON.stringify(NextShowPayload)
	},
	sender: {
		id: "123"
	},
	recipient: {
		id: "456"
	},
	timestamp: "789"
};

