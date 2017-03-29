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
const buildMoreInfoPayload = rewiredMessageBuilder.__get__('buildMoreInfoPayload');


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
			const event = createGetShowEvent(foreignMovies, "Action");
			const messageToSendBack = fbMessenger.receivedMessage(event);
			return messageToSendBack
				.then(msg => {	
					(() => messageBuilderTest.okGenericTemplateStructureTest(msg)).should.not.throw();
				});
		});
		it('should send a good quick-reply on noMoreShows event', function() {
			let event = createGetShowEvent("A non-existant showtype", "A bad genre");
			const p1 = fbMessenger.receivedMessage(event);

			event = createGetShowEvent(foreignMovies, "A bad genre");
			const p2 = fbMessenger.receivedMessage(event);

			return Promise.all([p1,p2]).then(msgs => msgs.map(msg => {
				messageBuilderTest.okQuickReplyStructureTest(msg);
			}));
		});
		it('should send a good quick-reply on "moreInfo"', function() {
			const msg = fbMessenger.receivedPostback(moreInfoPostBackEvent);
			//console.log(JSON.stringify(msg, null, 2));
			(() => messageBuilderTest.okQuickReplyStructureTest(msg)).should.not.throw();
		});
		it('should send a good quick-reply message on "willWatch"', function() {
			//these two will add a duplicate entry in db's 'watched' list 
			const p1 = fbMessenger.receivedPostback(willWatchPostBackEvent);
			const p2 = fbMessenger.receivedMessage(willWatchMoreInfoQuickReplyEvent);
			//clean up after ourselves
			//database.dropCollection("users");
			return Promise.all([p1, p2]).then(msgs => msgs.map(msg => {
				messageBuilderTest.okQuickReplyStructureTest(msg);
			}));
		});
		it('should send the next show on "nextShow"', function() {
			const p1 = fbMessenger.receivedPostback(NextShowPostBackEvent);
			const p2 = fbMessenger.receivedMessage(nextShowMoreInfoQuickReplyEvent);

			return Promise.all([p1, p2]).then(msgs => msgs.map(msg => {
				messageBuilderTest.okGenericTemplateStructureTest(msg);
			}));

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

function initEvents(events) {
	events.map(e => addMockDataToEvent(e));
}

function addMockDataToEvent(event) {
	event.sender = {
		id: "123"
	};
	event.recipient = {
		id: "123"
	};
	event.timestamp = "789";

	return event;
}

//create a builder function for these!!!!!!!
const quickReplyEventShowType = {
	message: {
		quick_reply: {
			payload: JSON.stringify(ShowTypePayload)
		},
		text: "hello"
	}
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
	}
};

function createGetShowEvent(showType, genre) {
	let state = buildState("showTypes", showType);
	state.push(buildStep("genres", genre));
	const payload = {
		state: state
	};

	const event = {
		message: {
			quick_reply: {
				payload: JSON.stringify(payload)
			},
			text: "hello"
		}
	};

	return addMockDataToEvent(event);
}



//create func
/*let state = buildState("showTypes", "A show type that doesn't exist!!!!");
state.push(buildStep("genres", "Horror"));
const payload = {
	state: state
};

const quickReplyEventNoExistoShowType = {
	message: {
		quick_reply: {
			payload: JSON.stringify(payload)
		},
		text: "hello"
	}
};*/


const gettingStartedPostBackEvent = {
	postback: {
		payload: '{"gettingStarted": ""}'
	}
};

const textMessageEvent = {
	message: {
		text: "hello",
	}
};

const moreInfoPayload = buildMoreInfoPayload("this movie is about bla bla...", "72d7801f0a6149136c7d5ee8", foreignMovies, "Action");
const moreInfoPostBackEvent = {
	postback: {
		payload: moreInfoPayload
	}
};



const willWatchPayload = buildWillWatchPayload("58d7803f0a6747036c7d5ee6", foreignMovies, "Children");
const willWatchPostBackEvent = {
	postback: {
		payload: willWatchPayload
	}
};

const moreInfowillWatchPayload = {
	state: buildState("moreInfoResponse", willWatchPayload)
};
//console.log(JSON.stringify(moreInfowillWatchPayload, null, 2));
const willWatchMoreInfoQuickReplyEvent = {
	message: {
		quick_reply: {
			payload: JSON.stringify(moreInfowillWatchPayload)
		},
		text: "desc of movie"
	}
};



const NextShowPayload = buildNextShowPayload(foreignMovies, "Children", "52d7801f0a6147136c7d5ee8");
const NextShowPostBackEvent = {
	postback: {
		payload: NextShowPayload
	}
};

const moreInfoNextShowPayload = {
	state: buildState("moreInfoResponse", NextShowPayload)
};
const nextShowMoreInfoQuickReplyEvent = {
	message: {
		quick_reply: {
			payload: JSON.stringify(moreInfoNextShowPayload)
		},
		text: "desc of movie"
	}
};



//change this so events are taken automatically..
const events = [quickReplyEventShowType, NextShowPostBackEvent, willWatchPostBackEvent, moreInfoPostBackEvent,
	textMessageEvent, gettingStartedPostBackEvent, quickReplyEventstartOver, nextShowMoreInfoQuickReplyEvent,
	willWatchMoreInfoQuickReplyEvent
];
initEvents(events);