/*jshint esversion: 6 */

const arabicText = require('../arabic-text.json');
const cache = require('./cache.js');
const database = require('./database.js');
const showButtons = "showButtons";
const tmdbBaseUrl = "image.tmdb.org/t/p";
const turkishBaseUrl = "imgur.com/";

module.exports = {
	getQuickReplyResponse: function(payload, recipientId) {
		const state = payload.state;
		const currState = state[state.length - 1];
		const userReply = getSingleKey(currState);

		//which question did the user reply to?
		switch (userReply) {
			case "showTypes":
				{
					state.push(buildStep("genres"));
					return buildQuickReplyMessage(recipientId, payload);
				}
			case "genres":
				{
					const chosenGenre = currState[userReply];
					const prevState = state[state.length - 2];
					const chosenShowTypeKey = getSingleKey(prevState);
					const chosenShowType = prevState[chosenShowTypeKey];
					return getNextShow(recipientId, chosenShowType, chosenGenre);
				}
			case "willWatchResponse":
				{
					//only 'startOver' button is present now...
					const chosenResponse = currState[userReply];
					return buildShowTypesQuickReply(recipientId);
				}
			case "noMoreShows":
				{
					//only 'startOver' button is present now...
					const chosenResponse = currState[userReply];
					return buildShowTypesQuickReply(recipientId);			
				}
			case "moreInfoResponse":
				{
					const chosenResponse = JSON.parse(currState[userReply]);
					const showType = chosenResponse.showType;
					const genre = chosenResponse.genre;
					
					if(chosenResponse.hasOwnProperty("willWatch")){
						const showDbId = chosenResponse.willWatch;
						return respondToWillWatch(recipientId, showDbId, showType, genre);
					}else if(chosenResponse.hasOwnProperty("nextShow")){
						const currShowId = chosenResponse.currShowId;
						return respondToNextShow(recipientId, showType, genre, currShowId);
					}
					break;
				}
			default:
				{
					throw new Error("There is no response for the userReply " + userReply);
				}
		}

	},

	getMoreInfoResponse: function(recipientId, description, showDbId, showType, genre) {
		const content = buildMoreInfoContent(description, showDbId, showType, genre);
		const payload = {
			state: buildState("moreInfoResponse")
		};
		return buildQuickReplyMessage(recipientId, payload, content);
	},

	getGettingStartedResponse: function(recipientId) {
		return buildShowTypesQuickReply(recipientId);
	},

	getTextResponse: function(recipientId, messageText) {
		return buildTextMessage(recipientId, messageText);
	},

	getWillWatchResponse: function(recipientId, showDbId, showType, genre) {
		return respondToWillWatch(recipientId, showDbId, showType, genre);
	},

	getNextShowResponse: function(recipientId, chosenShowType, chosenGenre, currShowId){
		return respondToNextShow(recipientId, chosenShowType, chosenGenre, currShowId);
	},

	getSenderActionResponse: function(recipientId, senderAction){
		return buildSenderActionMessage(recipientId, senderAction);
	}
};

function buildShowTypesQuickReply(recipientId){
		const payload = {
			state: buildState("showTypes")
		};
		const messageData = buildQuickReplyMessage(recipientId, payload);
		return messageData;
}

function respondToNextShow(recipientId, showType, genre, currShowId){
	//for now we'll add it to the watched list,
	//later we should add and then remove it after some time	
	database.addToWatchedList(recipientId, currShowId, showType, genre);
	return getNextShow(recipientId, showType, genre);
}

function buildNoMoreShowsMessage(recipientId){
	const payload = {
		state: buildState("noMoreShows")
	};
	return buildQuickReplyMessage(recipientId, payload);
}

function buildSenderActionMessage(recipientId, senderAction){
	return {
		recipient: {
			id: recipientId
		},
		sender_action: senderAction
	};
}

function respondToWillWatch(recipientId, showDbId, showType, genre){
	const payload = {
		state: buildState("willWatchResponse")
	};
	database.addToWatchedList(recipientId, showDbId, showType, genre);
	return buildQuickReplyMessage(recipientId, payload);
}

//The content built here will be used instead of arabicText
function buildMoreInfoContent(description, showDbId, showType, genre)
{
	const content = {
		"moreInfoResponseText": description,
		"moreInfoResponse": {}
	};

	const willWatchPayload = buildWillWatchPayload(showDbId, showType, genre);
	const nextShowPayload = buildNextShowPayload(showType, genre, showDbId);
	const moreInfoResponse = content.moreInfoResponse;
	//This is opposite to the arabicText structure
	moreInfoResponse[willWatchPayload] = "willWatch";
	moreInfoResponse[nextShowPayload] = "nextShow";

	return content;
}


function buildGenericTemplateMessage(show, recipientId, chosenShowType, chosenGenre){
	let messageData = buildEmptyMessage(recipientId);
	const baseUrl = (chosenShowType == "turkishSeries") ? turkishBaseUrl : (tmdbBaseUrl + "/w500");
	const imageUrl = baseUrl + show.imageUrl;
	const youtubeTrailerUrl = "www.youtube.com/watch?v=" + show.trailerKey;
	const title = show.name + " (" + show.releaseDate.split('-')[0] + ")";
	const buttons = getShowButtons(show.description, show._id, chosenShowType, chosenGenre);
	const element = buildElement(title, show.description, youtubeTrailerUrl, imageUrl, buttons);
	const attachment = buildAttachment([element], "generic");
	addFieldToMessage(messageData, "attachment", attachment);
	return messageData;	
}

function getNextShow(recipientId, chosenShowType, chosenGenre) {
	return new Promise((resolve, reject) => {
		cache.getNextShow(recipientId, chosenShowType, chosenGenre)
		.then(show => {
			const messageData = buildGenericTemplateMessage(show, recipientId, chosenShowType, chosenGenre);
			resolve(messageData);
		})
		.catch(e => {
			if(e === "NoMoreShows"){
				resolve(buildNoMoreShowsMessage(recipientId));
			}else{
				reject(e);
			}
		});
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

function buildQuickReplyMessage(recipientId, payload, content = arabicText) {
	const messageText = getQuickReplyMessageText(payload, content);
	const quickReplies = buildQuickReplies(payload, content);
	let messageData = buildTextMessage(recipientId, messageText, content);

	addFieldToMessage(messageData, "quick_replies", quickReplies);
	return messageData;
}

function buildQuickReplies(payload, content){
	let quickReplies = [];
	const category = getCurrCategory(payload);
	const categoryChildren = content[category];

	for (let key in categoryChildren) {
		setCurrCategory(payload, key);
		const title = (content != arabicText) ? arabicText[category][categoryChildren[key]]:
		arabicText[category][key];

		const quickReply = buildQuickReply(title, JSON.stringify(payload));
		quickReplies.push(quickReply);
	}

	return quickReplies;
}

function buildQuickReply(title, payload, contentType = "text"){
	return{
		"content_type": contentType,
		"title": title,
		"payload": payload
	};
}

function getQuickReplyMessageText(payload, content){
	const suffix = "Text";
	const category = getCurrCategory(payload);
	const messageText = content[category + suffix];
	
	if (!messageText) {
		throw new Error("The message-text for the " + category + " category wasn't found!");
	}

	return messageText;	
}


function setCurrCategory(payload, val){
	const currCategory = getCurrCategory(payload);
	let currState = getCurrState(payload);
	currState[currCategory] = val;
}

const getCurrCategory = payload => getSingleKey(getCurrState(payload));
const getCurrState = payload => payload.state[payload.state.length - 1];
const getSingleKey = obj => Object.keys(obj)[0];

//a single step to be contained in a state array
const buildStep = (key, val) => {
	return {[key]: val};
};
//an array of steps making the state
const buildState = (key, val) => [{[key]: val}];


function getShowButtons(showDescription, showDbId, showType, genre) {
	const buttonData = arabicText[showButtons];
	let buttons = [];

	const moreInfoPayload = buildMoreInfoPayload(showDescription, showDbId, showType, genre);
	buttons.push(buildPostBackButton("postback", buttonData.moreInfo, moreInfoPayload));

	const willWatchPayload = buildWillWatchPayload(showDbId, showType, genre);
	buttons.push(buildPostBackButton("postback", buttonData.willWatch, willWatchPayload));

	const nextShowPayload = buildNextShowPayload(showType, genre, showDbId);
	buttons.push(buildPostBackButton("postback", buttonData.nextShow, nextShowPayload));

	return buttons;
}

function getMoreInfoQuickReplies(showDescription, showDbId, showType, genre){

}

function buildMoreInfoPayload(showDescription, showDbId, showType, genre){
	return JSON.stringify({
		moreInfo: showDescription,
		showId: showDbId,
		showType: showType,
		genre: genre
	});
}

function buildWillWatchPayload(showDbId, showType, genre) {
	return JSON.stringify({
		willWatch: showDbId,
		showType: showType,
		genre: genre
	});
}

function buildNextShowPayload(showType, genre, showDbId) {
	return JSON.stringify({
		nextShow: true,
		currShowId: showDbId,
		showType: showType,
		genre: genre
	});
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