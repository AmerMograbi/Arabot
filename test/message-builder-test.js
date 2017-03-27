/*jshint esversion: 6 */

const messageBuilder = require('../lib/message-builder.js');
const assert = require('assert');
const should = require('should');
const rewire = require('rewire');
const rewiredMessageBuilder = rewire('../lib/message-builder.js');
const buildState = rewiredMessageBuilder.__get__('buildState');
const buildStep = rewiredMessageBuilder.__get__('buildStep');

const foreignMovies = "foreignMovies";

describe('MessageBuilder', function() {

	describe('#getQuickReplyResponse()', function() {
		it('should return a correct generic template strucutre', function() {
			let state = buildState("showTypes", foreignMovies);
			state.push(buildStep("genres", "Action"));
			const payload = {
				state: state
			};
			return messageBuilder.getQuickReplyResponse(payload, "5523634634578")
				.then(msg => {
					(() => okGenericTemplateStructureTest(msg)).should.not.throw();
				});
		});
		it('should return a correct quick-reply strucutre', function() {
			const payload = {
				state: buildState("showTypes", foreignMovies)
			};
			const msg = messageBuilder.getQuickReplyResponse(payload, "123");
			(() => okQuickReplyStructureTest(msg)).should.not.throw();
		});
	});

	describe('#getGettingStartedResponse()', function() {
		it('should return a correct message strucutre', function() {
			const msg = messageBuilder.getGettingStartedResponse("123");
			(() => okQuickReplyStructureTest(msg)).should.not.throw();
		});
	});

	describe('#getMoreInfoResponse()', function() {
		it('should return a correct button template strucutre', function() {
			let msg = messageBuilder.getMoreInfoResponse("123", "This movie is about bla bla...", "1242141", foreignMovies, "Action");
			(() => okQuickReplyStructureTest(msg)).should.not.throw();
			//console.log(JSON.stringify(msg, null, 2));
			(() => messageBuilder.getMoreInfoResponse("123", "", "1242141", foreignMovies, "Action")).should.throw();
		});
	});

});



const okQuickReplyStructureTest = function(msg) {
	hasRecepient(msg);
	hasText(msg);

	//check if quick_replies isn't an empty list
	assert.ok(msg.message.quick_replies, "Quick-reply message should have quick_replies attribute");
	assert.ok(msg.message.quick_replies[0], "Quick-reply message has 0 quickReplies");

	//check if all quick replies have title and ok payload structure.
	for (let quickReply of msg.message.quick_replies) {
		assert.ok(quickReply.title, "There is no title attribute for quickReply");
		assert.ok(quickReply.payload, "There is no payload attribute for quickReply");
		const payload = JSON.parse(quickReply.payload);
		assert.ok(payload.state, "There is no state attribute for quickReply's payload");
	}
};

const okGenericTemplateStructureTest = function(msg) {
	hasRecepient(msg);
	const attachment = msg.message.attachment;
	isTemplate(attachment);
	assert.equal(attachment.payload.template_type, "generic", "Generic template type should be 'generic'");
	assert.ok(attachment.payload.elements, "Generic template should have elements attribute");
	//checking if there is at least 1 element
	assert.ok(attachment.payload.elements[0], "Generic template should has 0 elements");

	//check if all elements have title, subtitle,...
	for (let element of attachment.payload.elements) {
		assert.ok(element.title, "There is no title attribute for element");
		assert.ok(element.subtitle, "There is no subtitle attribute for element");
		assert.ok(element.image_url, "There is no image_url attribute for element");
		assert.ok(element.item_url, "There is no item_url attribute for element");

		//validate buttons of element
		buttonsOk(element.buttons);
	}
};

const okButtonTemplateStructureTest = function(msg) {
	hasRecepient(msg);
	const attachment = msg.message.attachment;
	isTemplate(attachment);
	assert.equal(attachment.payload.template_type, "button", "Template type should be 'button'");
	assert.ok(attachment.payload.buttons, "No buttons attribute found for button template");
	assert.ok(attachment.payload.text, "There is no text in the button template");
	//checking if there is at least 1 button
	assert.ok(attachment.payload.buttons[0], "There are 0 buttons in the button template");
	buttonsOk(attachment.payload.buttons);
};

function buttonsOk(buttons){
	for (let button of buttons) {
		assert.ok(button.type, "Button has no type");
		assert.ok(button.title, "Button has no title");
		const payloadOrUrl = button.payload || button.url;
		assert.ok(payloadOrUrl, "Button has no payload or url attribute");
	}	
}

function hasRecepient(msg) {
	//check if the message has a recipient
	assert.ok(msg);
	assert.ok(msg.recipient, "Message has no recipient");
	assert.ok(msg.recipient.id, "Message has no recipient id");
}

function isTemplate(attachment) {
	assert.ok(attachment);
	assert.equal(attachment.type, "template", "Attachment type isn't template");
	assert.ok(attachment.payload, "Attachment has no payload");
}

function hasText(msg){
	//check if the message has text
	assert.ok(msg.message);
	assert.ok(msg.message.text, "Message has no text");
}

function okTextMessageStructureTest(msg){
	hasRecepient(msg);
	hasText(msg);
}



module.exports = {
	okQuickReplyStructureTest: okQuickReplyStructureTest,
	okGenericTemplateStructureTest: okGenericTemplateStructureTest,
	okButtonTemplateStructureTest: okButtonTemplateStructureTest,
	okTextMessageStructureTest: okTextMessageStructureTest
};