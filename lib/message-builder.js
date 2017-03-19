/*jshint esversion: 6 */

const arabicText = require('../arabic-text.json');
const database = require('./database.js');
const delimiter = "->";
const categoryChosenDelimiter = ":";
const genres = "genres";
const showTypes = "showTypes";
const showButtons = "showButtons";
const tmdbBaseUrl = "image.tmdb.org/t/p";

module.exports = {
	getQuickReplyResponse: function(payload, recipientId) {
		const payLoadAsArray = payload.split(delimiter);
		const currState = payLoadAsArray[payLoadAsArray.length - 1].split(categoryChosenDelimiter);
		const category = currState[0];

		switch (category) {
			case showTypes:
				{
					return buildQuickReplyMessage(recipientId, payload + delimiter + genres);
				}
			case genres:
				{
					const chosenGenre = currState[1];
					const prevState = payLoadAsArray[payLoadAsArray.length - 2].split(categoryChosenDelimiter);
					const chosenShowType = prevState[1];
					return buildGenericTemplateMessage(recipientId, chosenShowType, chosenGenre);
				}
			default:
				{
					throw new Error("There is no response for the category " + category);
				}
		}

	},

	getGettingStartedResponse: function(recipientId) {
		const messageData = buildQuickReplyMessage(recipientId, showTypes);
		return messageData;
	},

	getDelimiter: function() {
		return delimiter;
	},

	getCategoryChosenDelimiter: function() {
		return categoryChosenDelimiter;
	},

	getTextResponse: function(recipientId, messageText) {
		return buildTextMessage(recipientId, messageText);
	}
};

function buildGenericTemplateMessage(recipientId, chosenShowType, chosenGenre) {
	return new Promise((resolve, reject) => {
		database.findByGenre(chosenShowType, chosenGenre)
			.then(showsFound => {
				const itemUrl = "https://www.youtube.com/watch?v=pmxYePDPV6M";

				let messageData = buildEmptyMessage(recipientId);
				const elements = showsFound.map(s => {
					const imageUrl = buildImageUrl(tmdbBaseUrl, "/w342", s.imageUrl);
					buildElement(s.name, s.description, itemUrl, imageUrl, getShowButtons());
				});
				const attachment = buildAttachment(elements);
				addFieldToMessage(messageData, "attachment", attachment);
				resolve(messageData);
			})
			.catch(e => reject(e));

	});
}

function buildImageUrl(baseUrl, size, path) {
	return baseUrl + size + path;
}

// input- state: 'category:chosen ->...-> category'
// output- state: 'category:chosen ->...-> category->chosen'
function buildQuickReplyMessage(recipientId, state) {
	let quickReplies = [];

	if (!recipientId)
		throw new Error("No recipient Id was given.");

	const stateArray = state.split(delimiter);
	const category = stateArray[stateArray.length - 1];

	const categoryChildren = arabicText[category];
	const suffix = "Text";
	const messageText = arabicText[category + suffix];
	if (!messageText) {
		throw new Error("The message-text for the " + category + " category wasn't found!");
	}

	for (let key in categoryChildren) {
		let quickReply = {
			"content_type": "text",
			"title": categoryChildren[key],
			"payload": (state + categoryChosenDelimiter + key)
		};
		quickReplies.push(quickReply);
	}

	let messageData = buildTextMessage(recipientId, messageText);
	addFieldToMessage(messageData, "quick_replies", quickReplies);
	return messageData;
}

function getShowButtons() {
	const buttonData = arabicText[showButtons];
	let buttons = [];
	for (let key in buttonData) {
		buttons.push(buildPostBackButton("postback", buttonData[key], key));
	}
	return buttons;
}

function buildPostBackButton(type, title, payload) {
	let postBackButton = {
		type: type,
		title: title,
		payload: payload
	};

	return postBackButton;
}

function buildUrlButton(type, url, title) {
	let urlButton = {
		type: type,
		url: url,
		title: title
	};

	return urlButton;
}

function buildElement(title, subtitle, itemUrl, imageUrl, buttons) {
	let element = {
		title: title,
		subtitle: subtitle,
		item_url: itemUrl,
		image_url: imageUrl,
		buttons: buttons
	};

	return element;
}

function buildAttachment(elements) {
	const attachment = {
		type: "template",
		payload: {
			template_type: "generic",
			elements: elements
		}
	};

	return attachment;
}

function buildEmptyMessage(recipientId) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {}
	};
	return messageData;
}

function buildTextMessage(recipientId, messageText) {
	if (!messageText)
		throw new Error("Message text is empty.");

	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};
	return messageData;
}

function addFieldToMessage(messageData, field, value) {
	if (field && value)
		messageData.message[field] = value;
	else
		throw new Error("field or value is undefined");
}