/*jshint esversion: 6 */

const Test = require('./test.js');
const messageBuilder = require('../lib/message-builder.js');
const assert = require('assert');



class MessageBuilderTest extends Test {

	getQuickReplyResponseTest() {
		const delimiter = messageBuilder.getDelimiter();
		assert.throws(() => messageBuilder.getQuickReplyResponse("showTypes-foreign movie", 123), Error);
		assert.throws(() => messageBuilder.getQuickReplyResponse("adgsasgasdga", 123), Error);
		assert.throws(() => messageBuilder.getQuickReplyResponse("", 123), Error);
		assert.throws(() => messageBuilder.getQuickReplyResponse("foreign movie", 123), Error);
		assert.throws(() => messageBuilder.getQuickReplyResponse("showTypes" + delimiter + "foreign movie", ""), Error);
		assert.throws(() => messageBuilder.getQuickReplyResponse("showTypes" + delimiter + "foreign movie", undefined), Error);

		assert.doesNotThrow(() => messageBuilder.getQuickReplyResponse("showTypes" + delimiter + "foreign movie", 123), Error);
		assert.doesNotThrow(() => messageBuilder.getQuickReplyResponse("genres" + delimiter + "actionCrime", 123), Error);

		let msg = messageBuilder.getQuickReplyResponse("showTypes" + delimiter + "foreign movie", 123);
		okQuickReplyStructureTest(msg);
	}

	getGettingStartedResponseTest(){
		const delimiter = messageBuilder.getDelimiter();
		const msg = messageBuilder.getGettingStartedResponse(123);
		okQuickReplyStructureTest(msg);
	}

	buildTemplateMessageTest(){
		assert.ok("1");
	}
}

function okQuickReplyStructureTest(msg){
	const delimiter = messageBuilder.getDelimiter();

	//check if the message has a recipient
	assert.ok(msg);
	assert.ok(msg.recipient);
	assert.ok(msg.recipient.id);

	//check if the message has text
	assert.ok(msg.message);
	assert.ok(msg.message.text);

	//check if quick_replies isn't an empty list
	assert.ok(msg.message.quick_replies);
	assert.ok(msg.message.quick_replies[0]);

	//check if all quick replies have title and correct payload structure.
	for(let quickReply of msg.message.quick_replies){
		assert.ok(quickReply.title);
		const payLoadAsArray = quickReply.payload.split(delimiter);
		assert.ok(payLoadAsArray[0]);
		assert.ok(payLoadAsArray[1]);
	}
}

let mbTest = new MessageBuilderTest();

module.exports = mbTest;