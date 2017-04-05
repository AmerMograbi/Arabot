/*jshint esversion: 6 */

const arabicText = require('../arabic-text.json');
const cache = require('./cache.js');
const showButtons = "showButtons";
const tmdbBaseUrl = "image.tmdb.org/t/p";
const turkishBaseUrl = "imgur.com/";

module.exports = {
	getQuickReplyResponse: function(payload, recipientId) {
		const state = payload.state;
		const currState = state[state.length - 1];
		const userReply = getSingleKey(currState);

		//what did the user reply to?
		switch (userReply) {
			case "showTypes":
				{
					const chosenShowType = currState[userReply];
					state.push(buildStep("genres"));
					console.log("The chosen showType is: " + chosenShowType);
					const filterOutArray = fillGenresFilterOutArray(chosenShowType);
					console.log("The filterOutArray is: " + filterOutArray);
					return buildQuickReplyMessage(recipientId, payload, arabicText, filterOutArray);
				}
			case "genres":
				{
					const chosenGenre = currState[userReply];
					const prevState = state[state.length - 2];
					const chosenShowTypeKey = getSingleKey(prevState);
					const chosenShowType = prevState[chosenShowTypeKey];
					return getNextShow(recipientId, chosenShowType, chosenGenre);
				}
			case "likedResponse":
				{
					const chosenResponse = JSON.parse(currState[userReply]);
					if(chosenResponse.hasOwnProperty("startOver")){
						return buildShowTypesQuickReply(recipientId);
					}else if(chosenResponse.hasOwnProperty("nextShow")){
						const showType = chosenResponse.showType;
						const genre = chosenResponse.genre;
						const currShowId = chosenResponse.currShowId;

						return respondToNextShow(recipientId, showType, genre, currShowId);
					}
					console.log("type of chosenResponse= "+ typeof chosenResponse);
					break;
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
					if(chosenResponse.hasOwnProperty("startOver")){
						return buildShowTypesQuickReply(recipientId);
					}else if(chosenResponse.hasOwnProperty("liked")){
						const showDbId = chosenResponse.liked;
						return respondToLiked(recipientId, showDbId, showType, genre);
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

	getLikedResponse: function(recipientId, showDbId, showType, genre) {
		return respondToLiked(recipientId, showDbId, showType, genre);
	},

	getNextShowResponse: function(recipientId, chosenShowType, chosenGenre, currShowId){
		return respondToNextShow(recipientId, chosenShowType, chosenGenre, currShowId);
	},

	getSenderActionResponse: function(recipientId, senderAction){
		return buildSenderActionMessage(recipientId, senderAction);
	}
};


function fillGenresFilterOutArray(chosenShowType){
	if(chosenShowType == "turkishSeries"){
		//genres we want to remove
		return ["Thriller", "Horror", "Fantasy", "Adventure", "Children", "Comedy"];
	}
	return [];
}


function buildShowTypesQuickReply(recipientId){
		const payload = {
			state: buildState("showTypes")
		};
		const messageData = buildQuickReplyMessage(recipientId, payload);
		return messageData;
}

function respondToNextShow(recipientId, showType, genre, currShowId){
	//for now we'll add it to the seen list,
	//later we should add and then remove it after some time	
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

function respondToLiked(recipientId, showDbId, showType, genre){
	const content = buildLikedContent(showDbId, showType, genre);
	const payload = {
		state: buildState("likedResponse")
	};
	const liked = true;
	//change this into a more specific function
	cache.addToSeenList(recipientId, showDbId, showType, genre, liked);
	return buildQuickReplyMessage(recipientId, payload, content);
}

//The content built here will be used for payloads instead of simply 
//taking them from 'arabic-text.json'. The arabic text itself will 
//still be brought from 'arabic-text.json'.
function buildMoreInfoContent(description, showDbId, showType, genre)
{
	const content = {
		"moreInfoResponseText": description,
		"moreInfoResponse": {}
	};
	const likedPayload = buildLikedPayload(showDbId, showType, genre);
	const nextShowPayload = buildNextShowPayload(showType, genre, showDbId);
	const startOverPayload = buildStartOverPayload();

	const moreInfoResponse = content.moreInfoResponse;
	//The order here matters to how it appears to the users
	moreInfoResponse[nextShowPayload] = "nextShow";
	moreInfoResponse[startOverPayload] = "startOver";
	moreInfoResponse[likedPayload] = "liked";
	
	return content;
}

function buildLikedContent(showDbId, showType, genre){
	const content = {
		"likedResponseText": arabicText.likedResponseText,
		"likedResponse": {}
	};	
	const nextShowPayload = buildNextShowPayload(showType, genre, showDbId);
	const startOverPayload = buildStartOverPayload();
	const likedResponse = content.likedResponse;
	//The order here matters to how it appears to the users
	likedResponse[nextShowPayload] = "nextShow";
	likedResponse[startOverPayload] = "startOver";

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
			cache.addToSeenList(recipientId, show._id, chosenShowType, chosenGenre);
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

	buttons.push(buildPostBackButton("postback", buttonData.liked, "liked"));
	const attachment = buildAttachment(buttons, "button", description);
	addFieldToMessage(messageData, "attachment", attachment);
	return messageData;
}

function buildQuickReplyMessage(recipientId, payload, content = arabicText, filterOutArray = []) {
	const messageText = getQuickReplyMessageText(payload, content);
	const quickReplies = buildQuickReplies(payload, content, filterOutArray);
	let messageData = buildTextMessage(recipientId, messageText, content);

	addFieldToMessage(messageData, "quick_replies", quickReplies);
	return messageData;
}

function buildQuickReplies(payload, content, filterOutArray){
	let quickReplies = [];
	const category = getCurrCategory(payload);
	const categoryChildren = content[category];
	console.log("filterOutArray is: " + filterOutArray);
	console.log("categoryChildren before: " + JSON.stringify(categoryChildren));
	filterOutContent(categoryChildren, filterOutArray);
	console.log("categoryChildren after: " + JSON.stringify(categoryChildren));
	for (let key in categoryChildren) {
		setCurrCategory(payload, key);
		const title = (content != arabicText) ? arabicText[category][categoryChildren[key]]:
		arabicText[category][key];

		const quickReply = buildQuickReply(title, JSON.stringify(payload));
		quickReplies.push(quickReply);
	}

	return quickReplies;
}

function filterOutContent(categoryChildren, filterArray){
	if(filterArray.length <= 0){
		return;
	}

	for(let key in categoryChildren){
		if(filterArray.includes(key)){
			delete categoryChildren[key];
			console.log("deleted key= " + key);
		}
	}
}


function setCurrCategory(payload, val){
	const currCategory = getCurrCategory(payload);
	let currState = getCurrState(payload);
	currState[currCategory] = val;
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
	const likedPayload = buildLikedPayload(showDbId, showType, genre);
	const nextShowPayload = buildNextShowPayload(showType, genre, showDbId);

	//The order is important to how it appears in the messenger
	buttons.push(buildPostBackButton("postback", buttonData.nextShow, nextShowPayload));
	buttons.push(buildPostBackButton("postback", buttonData.moreInfo, moreInfoPayload));
	buttons.push(buildPostBackButton("postback", buttonData.liked, likedPayload));

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

function buildLikedPayload(showDbId, showType, genre) {
	return JSON.stringify({
		liked: showDbId,
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

function buildStartOverPayload(){
	return JSON.stringify({
		startOver: true
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