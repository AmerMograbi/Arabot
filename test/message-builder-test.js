/*jshint esversion: 6 */

const messageBuilder = require('../lib/message-builder.js');
const assert = require('assert');
const should = require('should');

const foreignMovies = "foreign movies";
const delimiter = messageBuilder.getDelimiter();
const keyValDelimiter = messageBuilder.getkeyValDelimiter();


describe('MessageBuilder', function() {

	describe('#getQuickReplyResponse()', function() {
		it('should throw an exception when using a wrong delimiter', function() {
			(() => messageBuilder.getQuickReplyResponse("showTypes-foreign movies", 123)).should.throw();
		});
		it('should throw on bad payload input', function() {
			(() => messageBuilder.getQuickReplyResponse("adgsasgasdga", 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse("", 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse(foreignMovies, 123)).should.throw();
			(() => messageBuilder.getQuickReplyResponse("showTypes" + keyValDelimiter + foreignMovies, "")).should.throw();
			(() => messageBuilder.getQuickReplyResponse("showTypes" + keyValDelimiter + foreignMovies, undefined)).should.throw();
		});
		it('should return a correct generic template strucutre', function() {
			const state = "showTypes" + keyValDelimiter + foreignMovies + delimiter + "genres" + keyValDelimiter + "Action";
			return messageBuilder.getQuickReplyResponse(state, 123)
				.then(msg => {
					(() => okGenericTemplateStructureTest(msg)).should.not.throw();
				});
		});
		it('should return a correct quick-reply strucutre', function() {
			const state = "showTypes" + keyValDelimiter + foreignMovies;
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

	describe('#getMoreInfoResponse()', function() {
		it('should return a correct button template strucutre', function() {
			let msg = messageBuilder.getMoreInfoResponse(123, "This movie is about bla bla...");
			(() => okButtonTemplateStructureTest(msg)).should.not.throw();
			//console.log(JSON.stringify(msg, null, 2));
			msg = messageBuilder.getMoreInfoResponse(123, "");
			(() => okButtonTemplateStructureTest(msg)).should.throw();	
		});
	});

});



const okQuickReplyStructureTest = function(msg) {
	const delimiter = messageBuilder.getDelimiter();
	hasRecepient(msg);

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
const okStepStructure = function(step) {
	const keyValDelimiter = messageBuilder.getkeyValDelimiter();
	const stepArray = step.split(keyValDelimiter);
	assert.ok(stepArray[0] && stepArray[1]);
};

const okGenericTemplateStructureTest = function(msg) {
	hasRecepient(msg);
	const attachment = msg.message.attachment;
	isTemplate(attachment);
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
		buttonsOk(element.buttons);
	}
};

const okButtonTemplateStructureTest = function(msg) {
	hasRecepient(msg);
	const attachment = msg.message.attachment;
	isTemplate(attachment);
	assert.equal(attachment.payload.template_type, "button");
	assert.ok(attachment.payload.buttons);
	assert.ok(attachment.payload.text);
	//checking if there is at least 1 button
	assert.ok(attachment.payload.buttons[0]);
	buttonsOk(attachment.payload.buttons);
};

function buttonsOk(buttons){
	for (let button of buttons) {
		assert.ok(button.type);
		assert.ok(button.title);
		const payloadOrUrl = button.payload || button.url;
		assert.ok(payloadOrUrl);
	}	
}

function hasRecepient(msg) {
	//check if the message has a recipient
	assert.ok(msg);
	assert.ok(msg.recipient);
	assert.ok(msg.recipient.id);
}

function isTemplate(attachment) {
	assert.ok(attachment);
	assert.equal(attachment.type, "template");
	assert.ok(attachment.payload);
}



module.exports = {
	okQuickReplyStructureTest: okQuickReplyStructureTest,
	okGenericTemplateStructureTest: okGenericTemplateStructureTest,
	okButtonTemplateStructureTest: okButtonTemplateStructureTest
};