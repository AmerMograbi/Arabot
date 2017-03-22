/*jshint esversion: 6 */

const arabicText = require('../arabic-text.json');
const database = require('./database.js');
const genres = "genres";
const showTypes = "showTypes";
const showButtons = "showButtons";
const tmdbBaseUrl = "image.tmdb.org/t/p";

module.exports = {
	getQuickReplyResponse: function(payload, recipientId) {
		const state = payload.state;
		const currState = state[state.length - 1];
		const category = getSingleKey(currState);

		switch (category) {
			case showTypes:
				{
					state.push(buildStep(genres));
					return buildQuickReplyMessage(recipientId, payload);
				}
			case genres:
				{
					const chosenGenre = currState[category];
					const prevState = state[state.length - 2];
					const chosenShowTypeKey = getSingleKey(prevState);
					const chosenShowType = prevState[chosenShowTypeKey];
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
		const payload = {
			state: buildState(showTypes)
		};
		const messageData = buildQuickReplyMessage(recipientId, payload);
		return messageData;
	},

	getTextResponse: function(recipientId, messageText) {
		return buildTextMessage(recipientId, messageText);
	}
};

function buildGenericTemplateMessage(recipientId, chosenShowType, chosenGenre) {
	//check if it's in the cache
	//cache.get(recipientId, chosenShowType, chosenGenre);
	return new Promise((resolve, reject) => {
		database.findByGenre(chosenShowType, chosenGenre)
			.then(showsFound => {
				let messageData = buildEmptyMessage(recipientId);
				const elements = showsFound.map(s => {
					const imageUrl = tmdbBaseUrl + "/w500" + s.imageUrl;
					const youtubeTrailerUrl = "www.youtube.com/watch?v=" + s.trailerKey;
					const title = s.name + " (" + s.releaseDate.split('-')[0] + ")";
					return buildElement(title, s.description, youtubeTrailerUrl, imageUrl, getShowButtons(s.description, s._id));
				});
				const attachment = buildAttachment(elements, "generic");
				addFieldToMessage(messageData, "attachment", attachment);
				resolve(messageData);
			})
			.catch(e => reject(e));

	});
}

function buildButtonTemplateMessage(recipientId, description) {
	let buttons = [];
	const buttonData = arabicText[showButtons];
	let messageData = buildEmptyMessage(recipientId);

	buttons.push(buildPostBackButton("postback", buttonData.willWatch, "willWatch"));
	const attachment = buildAttachment(buttons, "button", description);
	addFieldToMessage(messageData, "attachment", attachment);
	return messageData;
}


function buildQuickReplyMessage(recipientId, payload) {
	let quickReplies = [];

	if (!recipientId)
		throw new Error("No recipient Id was given.");
	const state = payload.state;
	const currState = state[state.length - 1];
	const category = getSingleKey(currState);

	const categoryChildren = arabicText[category];
	const suffix = "Text";
	const messageText = arabicText[category + suffix];
	if (!messageText) {
		throw new Error("The message-text for the " + category + " category wasn't found!");
	}

	for (let child in categoryChildren) {

		currState[category] = child;
		let quickReply = {
			"content_type": "text",
			"title": categoryChildren[child],
			"payload": payload
		};
		quickReplies.push(quickReply);
	}

	let messageData = buildTextMessage(recipientId, messageText);
	addFieldToMessage(messageData, "quick_replies", quickReplies);
	return messageData;
}

//a single step to be contained in a state array
function buildStep(key, val) {
	return {
		[key]: val
	};
}

//an array of steps making the state
function buildState(key, val) {
	return [{
		[key]: val
	}];
}

function getSingleKey(obj) {
	return Object.keys(obj)[0];
}

function getShowButtons(showDescription, showDbId) {
	const buttonData = arabicText[showButtons];
	let buttons = [];

	const descPayload = {
		moreInfo: showDescription
	};
	buttons.push(buildPostBackButton("postback", buttonData.moreInfo, descPayload));

	const willWatchPayload = {
		willWatch: showDbId
	};
	buttons.push(buildPostBackButton("postback", buttonData.willWatch, willWatchPayload));

	buttons.push(buildPostBackButton("postback", buttonData.next, "next"));
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
	} else if (templateType == "button") {
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