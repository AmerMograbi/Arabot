/*jshint esversion: 6 */

const messageBuilder = require('../lib/message-builder.js');
const assert = require('assert');
const should = require('should');

const foreignMovies = "foreign movies";
const delimiter = messageBuilder.getDelimiter();


describe('MessageBuilder', function() {

	describe('#getQuickReplyResponse()', function() {
		it('should throw an exception when using a wrong delimiter', function() {
			(() => messageBuilder.getQuickReplyResponse("showTypes-foreign movies", 123)).should.throw();
		});
		it('should throw on bad payload input', function() {
			(() => messageBuilder.getQuickReplyResponse("adgsasgasdga", 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse("", 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse(foreignMovies, 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse("showTypes" + delimiter + foreignMovies, "")).should.throw();
			(() => messageBuilder.getQuickReplyResponse("showTypes" + delimiter + foreignMovies, undefined)).should.throw();
		});
		it('should return a correct generic template strucutre', function() {
			(() => messageBuilder.getQuickReplyResponse("showTypes" + delimiter + foreignMovies, 123)).should.not.throw();
			return messageBuilder.getQuickReplyResponse("genres" + delimiter + "Action", 123)
				.then(msg => {	
					(() => okGenericTemplateStructureTest(msg)).should.not.throw();
				});
		});



		let msg = messageBuilder.getQuickReplyResponse("showTypes" + delimiter + foreignMovies, 123);
		it('should return a correct quick-reply strucutre', function() {
			(() => okQuickReplyStructureTest(msg)).should.not.throw();
		});
	});

	describe('#getGettingStartedResponse()', function() {
		const delimiter = messageBuilder.getDelimiter();
		const msg = messageBuilder.getGettingStartedResponse(123);

		it('should return a correct message strucutre', function() {
			(() => okQuickReplyStructureTest(msg)).should.not.throw();
		});
	});

});



const okQuickReplyStructureTest = function(msg) {
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
	for (let quickReply of msg.message.quick_replies) {
		assert.ok(quickReply.title);
		const payLoadAsArray = quickReply.payload.split(delimiter);
		assert.ok(payLoadAsArray[0]);
		assert.ok(payLoadAsArray[1]);
	}
};

const okGenericTemplateStructureTest = function(msg) {
	//console.log(JSON.stringify(msg, null, 2));
	const delimiter = messageBuilder.getDelimiter();

	//check if the message has a recipient
	assert.ok(msg);
	assert.ok(msg.recipient);
	assert.ok(msg.recipient.id);


	//check if quick_replies isn't an empty list
	assert.ok(msg.message.attachment);
	const attachment = msg.message.attachment;
	assert.equal(attachment.type, "template");
	assert.ok(attachment.payload);
	assert.equal(attachment.payload.template_type, "generic");

	assert.ok(attachment.payload.elements);
	//checking if there is at least 1 element
	assert.ok(attachment.payload.elements[0]);

	//check if all elements have title, subtitle,...
	for (let element of attachment.payload.elements) {
		assert.ok(element.title);
		assert.ok(element.subtitle);
		assert.ok(element.image_url);
		assert.ok(element.item_url);

		//validate buttons of element
		const buttons = element.buttons;
		for(let button of buttons){
			assert.ok(button.type);
			assert.ok(button.title);
			const payloadOrUrl = button.payload || button.url;
			assert.ok(payloadOrUrl);			
		}
	}
};



module.exports = {
	okQuickReplyStructureTest: okQuickReplyStructureTest,
	okGenericTemplateStructureTest: okGenericTemplateStructureTest
};