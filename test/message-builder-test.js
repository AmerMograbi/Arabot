/*jshint esversion: 6 */

const messageBuilder = require('../lib/message-builder.js');
const assert = require('assert');
const should = require('should');

const delimiter = messageBuilder.getDelimiter();


const okQuickReplyStructureTest = function (msg){
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
};

describe('MessageBuilder', function() {

	describe('#getQuickReplyResponse()', function() {
		it('should throw an exception when using a wrong delimiter', function() {
			(() => messageBuilder.getQuickReplyResponse("showTypes-foreign movie", 123)).should.throw();
		});
		it('should throw on bad payload input', function() {
			(() => messageBuilder.getQuickReplyResponse("adgsasgasdga", 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse("", 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse("foreign movie", 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse("showTypes" + delimiter + "foreign movie", "")).should.throw();
			(() => messageBuilder.getQuickReplyResponse("showTypes" + delimiter + "foreign movie", undefined)).should.throw();
		});	
		it('should not throw on good input', function() {
			(() => messageBuilder.getQuickReplyResponse("showTypes" + delimiter + "foreign movie", 123)).should.not.throw();
			(() => messageBuilder.getQuickReplyResponse("genres" + delimiter + "actionCrime", 123)).should.not.throw();
		});

		let msg = messageBuilder.getQuickReplyResponse("showTypes" + delimiter + "foreign movie", 123);
		it('should return a correct message strucutre', function() {
			(() => okQuickReplyStructureTest(msg)).should.not.throw();
		});		
	});

	describe('#getGettingStartedResponse()', function() {
		const delimiter = messageBuilder.getDelimiter();
		const msg = messageBuilder.getGettingStartedResponse(123);

		it('should return a correct message strucutre', function() {
			(() =>okQuickReplyStructureTest(msg)).should.not.throw();		
		});
	});

});



module.exports = {
	okQuickReplyStructureTest: okQuickReplyStructureTest
};