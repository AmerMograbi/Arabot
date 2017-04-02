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
const buildseenPayload = rewiredMessageBuilder.__get__('buildseenPayload');
const buildNextShowPayload = rewiredMessageBuilder.__get__('buildNextShowPayload');
const buildMoreInfoPayload = rewiredMessageBuilder.__get__('buildMoreInfoPayload');


const foreignMovies = "foreignMovies";
const turkishSeries = "turkishSeries";

describe('FbMessenger', function() {
	describe('#ChatBot conversation', function() {

		it('should send a good quick-reply on GETTING_STARTED postback', function() {
			const payload = '{"gettingStarted": ""}';
			const postbackEvent = buildPostBackResponseMessage(payload);
			const messageToSendBack = fbMessenger.receivedPostback(postbackEvent);
			messageBuilderTest.okQuickReplyStructureTest(messageToSendBack);
		});

		it('should send a good quick-reply on showType choose ', function() {
			const state = buildState("showTypes", foreignMovies);
			const quickReplyEvent = createQuickReplyEvent(state, "hello");
			const messageToSendBack = fbMessenger.receivedMessage(quickReplyEvent);
			messageBuilderTest.okQuickReplyStructureTest(messageToSendBack);
		});

		it('should send a good generic template on genre choose', function() {
			let state = createGetShowEventState(foreignMovies, "Action");
			let quickReplyEvent = createQuickReplyEvent(state, "hello");
			const p1 = fbMessenger.receivedMessage(quickReplyEvent);

			state = createGetShowEventState(turkishSeries, "Action");
			quickReplyEvent = createQuickReplyEvent(state, "hello");
			const p2 = fbMessenger.receivedMessage(quickReplyEvent);

			return Promise.all([p1, p2]).then(msgs => msgs.map(msg => {
				messageBuilderTest.okGenericTemplateStructureTest(msg);
			}));
		});

		it('should send a good quick-reply on noMoreShows event', function() {
			let state = createGetShowEventState("A non-existant showtype", "A bad genre");
			let quickReplyEvent = createQuickReplyEvent(state, "hello");
			const p1 = fbMessenger.receivedMessage(quickReplyEvent);

			state = createGetShowEventState(foreignMovies, "A bad genre");
			quickReplyEvent = createQuickReplyEvent(state, "hello");
			const p2 = fbMessenger.receivedMessage(quickReplyEvent);

			return Promise.all([p1, p2]).then(msgs => msgs.map(msg => {
				messageBuilderTest.okQuickReplyStructureTest(msg);
			}));
		});

		it('should send a good quick-reply on "moreInfo"', function() {
			const payload = buildMoreInfoPayload("movie desc...",
				"72d7801f0a6149136c7d5ee8", foreignMovies, "Action");
			const postbackEvent = buildPostBackResponseMessage(payload);
			const msg = fbMessenger.receivedPostback(postbackEvent);
			//console.log(JSON.stringify(msg, null, 2));
			(() => messageBuilderTest.okQuickReplyStructureTest(msg)).should.not.throw();
		});

		it('should send a good quick-reply message on "seen"', function() {
			const payload = buildseenPayload("58d7803f0a6747036c7d5ee6",
				foreignMovies, "Children");
			const postbackEvent = buildPostBackResponseMessage(payload);
			const p1 = fbMessenger.receivedPostback(postbackEvent);

			const state = buildState("moreInfoResponse", payload);
			const quickReplyEvent = createQuickReplyEvent(state, "hello");
			const p2 = fbMessenger.receivedMessage(quickReplyEvent);
			//clean up after ourselves
			//database.dropCollection("users");
			return Promise.all([p1, p2]).then(msgs => msgs.map(msg => {
				messageBuilderTest.okQuickReplyStructureTest(msg);
			}));
		});

		it('should send the next show on "nextShow"', function() {
			const payload = buildNextShowPayload(foreignMovies, "Children",
				"52d7801f0a6147136c7d5ee8");
			const postbackEvent = buildPostBackResponseMessage(payload);
			const p1 = fbMessenger.receivedPostback(postbackEvent);

			const state = buildState("moreInfoResponse", payload);
			const quickReplyEvent = createQuickReplyEvent(state, "hello");
			const p2 = fbMessenger.receivedMessage(quickReplyEvent);

			return Promise.all([p1, p2]).then(msgs => msgs.map(msg => {
				messageBuilderTest.okGenericTemplateStructureTest(msg);
			}));

		});

		it('should send a good quick-reply message on "startOver"', function() {
			const state = buildState("seenResponse", "startOver");
			const quickReplyEvent = createQuickReplyEvent(state, "hello");

			const messageToSendBack = fbMessenger.receivedMessage(quickReplyEvent);
			messageBuilderTest.okQuickReplyStructureTest(messageToSendBack);
		});

		it('should not throw if user sends a message with no handler', function() {
			const textMessageEvent = buildTextMessageResponseEvent("hello");
			const messageToSendBack = fbMessenger.receivedMessage(textMessageEvent);
		});
	});
});


function addEventDataToMessage(event) {
	event.sender = {
		id: "123"
	};
	event.recipient = {
		id: "123"
	};
	event.timestamp = "789";

	return event;
}

function createQuickReplyEvent(state, text) {
	const payload = {
		state: state
	};
	const msg = buildQuickReplyResponseMessage(payload, text);
	return addEventDataToMessage(msg);
}

//This state will induce a 'getShow' event as if a showType
//and a genre were chosen
function createGetShowEventState(showType, genre) {
	let state = buildState("showTypes", showType);
	state.push(buildStep("genres", genre));
	return state;
}

function buildQuickReplyResponseMessage(payload, text) {
	return {
		message: {
			quick_reply: {
				payload: JSON.stringify(payload)
			},
			text: text
		}
	};
}

function buildPostBackResponseMessage(payload) {
	const postback = {
		postback: {
			payload: payload
		}
	};

	return addEventDataToMessage(postback);
}

function buildTextMessageResponseEvent(text) {
	const msg = {
		message: {
			text: text,
		}
	};

	return addEventDataToMessage(msg);
}