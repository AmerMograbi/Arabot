/*jshint esversion: 6 */

const arabicText = require('../arabic-text.json');
const database = require('./database.js');
const delimiter = "->";
const keyValDelimiter = ":";
const genres = "genres";
const showTypes = "showTypes";
const showButtons = "showButtons";
const tmdbBaseUrl = "image.tmdb.org/t/p";

module.exports = {
	getQuickReplyResponse: function(payload, recipientId) {
		const payLoadAsArray = payload.split(delimiter);
		const currState = payLoadAsArray[payLoadAsArray.length - 1].split(keyValDelimiter);
		const category = currState[0];

		switch (category) {
			case showTypes:
				{
					return buildQuickReplyMessage(recipientId, payload + delimiter + genres);
				}
			case genres:
				{
					const chosenGenre = currState[1];
					const prevState = payLoadAsArray[payLoadAsArray.length - 2].split(keyValDelimiter);
					const chosenShowType = prevState[1];
					return buildGenericTemplateMessage(recipientId, chosenShowType, chosenGenre);
				}
			default:
				{
					throw new Error("There is no response for the category " + category);
				}
		}

	},

	getMoreInfoResponse: function(recipientId, description) {
		return buildButtonTemplateMessage(recipientId, description);
	},

	getGettingStartedResponse: function(recipientId) {
		const messageData = buildQuickReplyMessage(recipientId, showTypes);
		return messageData;
	},

	getDelimiter: function() {
		return delimiter;
	},

	getkeyValDelimiter: function() {
		return keyValDelimiter;
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
					const imageUrl = tmdbBaseUrl + "/w500" + s.imageUrl;
					return buildElement(s.name, s.description, itemUrl, imageUrl, getShowButtons(s.description));
				});
				const attachment = buildAttachment(elements, "generic");
				addFieldToMessage(messageData, "attachment", attachment);
				resolve(messageData);
			})
			.catch(e => reject(e));

	});
}

function buildButtonTemplateMessage(recipientId, description){
	let buttons = [];
	const buttonData = arabicText[showButtons];
	let messageData = buildEmptyMessage(recipientId);
	
	buttons.push(buildPostBackButton("postback", buttonData.willWatch, "willWatch"));
	const attachment = buildAttachment(buttons, "button", description);
	addFieldToMessage(messageData, "attachment", attachment);
	return messageData;
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
			"payload": (state + keyValDelimiter + key)
		};
		quickReplies.push(quickReply);
	}

	let messageData = buildTextMessage(recipientId, messageText);
	addFieldToMessage(messageData, "quick_replies", quickReplies);
	return messageData;
}

function getShowButtons(showDescription) {
	const buttonData = arabicText[showButtons];
	let buttons = [];

	const descPayload = "moreInfo" + keyValDelimiter + showDescription;
	buttons.push(buildPostBackButton("postback", buttonData.moreInfo, descPayload));
	buttons.push(buildPostBackButton("postback", buttonData.willWatch, "willWatch"));
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

function buildDefaultAction(url) {
	const defaultAction = {
		"type": "web_url",
		"url": url,
		"messenger_extensions": false,
		"webview_height_ratio": "tall"
	};

	return defaultAction;
}

function buildElement(title, subtitle, itemUrl, imageUrl, buttons) {
	if (!buttons)
		throw new Error("buttons is undefined.");

	const element = {
		title: title,
		subtitle: subtitle,
		item_url: itemUrl,
		image_url: imageUrl,
		buttons: buttons
	};

	return element;
}

function buildAttachment(items, templateType, text) {
	if (!items)
		throw new Error("items is undefined.");

	if (templateType == "generic") {
		return {
			type: "template",
			payload: {
				template_type: templateType,
				elements: items
			}
		};
	}else if (templateType == "button"){
		return {
			type: "template",
			payload: {
				template_type: templateType,
				text: text,
				buttons: items
			}
		};		
	}

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