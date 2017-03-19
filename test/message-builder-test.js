/*jshint esversion: 6 */

const messageBuilder = require('../lib/message-builder.js');
const assert = require('assert');
const should = require('should');

const foreignMovies = "foreign movies";
const delimiter = messageBuilder.getDelimiter();
const ccDelimiter = messageBuilder.getCategoryChosenDelimiter();


describe('MessageBuilder', function() {

	describe('#getQuickReplyResponse()', function() {
		it('should throw an exception when using a wrong delimiter', function() {
			(() => messageBuilder.getQuickReplyResponse("showTypes-foreign movies", 123)).should.throw();
		});
		it('should throw on bad payload input', function() {
			(() => messageBuilder.getQuickReplyResponse("adgsasgasdga", 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse("", 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse(foreignMovies, 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse("showTypes" + ccDelimiter + foreignMovies, "")).should.throw();
			(() => messageBuilder.getQuickReplyResponse("showTypes" + ccDelimiter + foreignMovies, undefined)).should.throw();
		});
		it('should return a correct generic template strucutre', function() {
			const state = "showTypes" + ccDelimiter + foreignMovies+ delimiter + "genres" + ccDelimiter + "Action";
			return messageBuilder.getQuickReplyResponse(state, 123)
				.then(msg => {	
					(() => okGenericTemplateStructureTest(msg)).should.not.throw();
				});
		});
		it('should return a correct quick-reply strucutre', function() {
			const state = "showTypes" + ccDelimiter + foreignMovies;
			const msg = messageBuilder.getQuickReplyResponse(state, 123);
			(() => okQuickReplyStructureTest(msg)).should.not.throw();
		});
	});

	describe('#getGettingStartedResponse()', function() {
		it('should return a correct message strucutre', function() {
			const msg = messageBuilder.getGettingStartedResponse(123);
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

	//check if all quick replies have title and ok payload structure.
	for (let quickReply of msg.message.quick_replies) {
		assert.ok(quickReply.title);
		assert.ok(quickReply.payload);
		const payloadArray = quickReply.payload.split(delimiter);
		payloadArray.map(okStepStructure);
	}
};

//checks if a step in the payload is ok
const okStepStructure = function(step){
	const ccDelimiter = messageBuilder.getCategoryChosenDelimiter();
	const stepArray = step.split(ccDelimiter);
	assert.ok(stepArray[0] && stepArray[1]);
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