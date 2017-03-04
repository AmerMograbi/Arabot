module.exports = {
  	receivedMessage: function (event) {
	  var senderID = event.sender.id;
	  var recipientID = event.recipient.id;
	  var timeOfMessage = event.timestamp;
	  var message = event.message;

	  console.log("Received message for user %d and page %d at %d with message:", 
	    senderID, recipientID, timeOfMessage);
	  console.log(JSON.stringify(message));

	  var messageId = message.mid;

	  var messageText = message.text;
	  var messageAttachments = message.attachments;

	  if (messageText) {

	    // If we receive a text message, check to see if it matches a keyword
	    // and send back the example. Otherwise, just echo the text we received.
	    console.log("messageText= '%s'", messageText);
	    switch (messageText) { 	
	      case 'Romance':
	      	console.log("got in the generic case");
	        sendGenericMessage(senderID);
	        break;

	      default:
	        sendTextMessage(senderID, messageText);
	    }
	  } else if (messageAttachments) {
	    sendTextMessage(senderID, "Message with attachment received");
	  }
	},


	sendTextMessage: function (recipientId, messageText) {
	  var messageData = {
	    recipient: {
	      id: recipientId
	    },
	    message: {
	      text: messageText
	    }
	  };

	  callSendAPI(messageData);
	},


	sendGenericMessage: function (recipientId) {
	  var messageData = {
	    recipient: {
	      id: recipientId
	    },
	    message: {
	      attachment: {
	        type: "template",
	        payload: {
	          template_type: "generic",
	          elements: [{
	            title: "بويراز كارايل",
	            subtitle: "hello there",
	            item_url: "http://www.3sk.tv/vb/showthread.php?p=4084966",               
	            image_url: "https://3sk.tv/art_imgs/148843464120532268.gif",
	            buttons: [{
	              type: "web_url",
	              url: "http://www.3sk.tv/vb/showthread.php?p=4084966",
	              title: "Open Web URL"
	            }, {
	              type: "postback",
	              title: "Call Postback",
	              payload: "Payload for first bubble",
	            }],
	          }, {
	            title: "touch",
	            subtitle: "Your Hands, Now in VR",
	            item_url: "https://www.oculus.com/en-us/touch/",               
	            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
	            buttons: [{
	              type: "web_url",
	              url: "https://www.oculus.com/en-us/touch/",
	              title: "Open Web URL"
	            }, {
	              type: "postback",
	              title: "Call Postback",
	              payload: "Payload for second bubble",
	            }]
	          }]
	        }
	      }
	    }
	  };  

	  callSendAPI(messageData);
	},

	callSendAPI: function (messageData) {
	  request({
	    uri: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: { access_token: process.env.VERIFY_TOKEN },
	    method: 'POST',
	    json: messageData

	  }, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	      var recipientId = body.recipient_id;
	      var messageId = body.message_id;

	      console.log("Successfully sent generic message with id %s to recipient %s", 
	        messageId, recipientId);
	    } else {
	      console.error("Unable to send message.");
	      console.error(response);
	      console.error(error);
	    }
	  });  
	},


	receivedPostback: function (event) {
	  var senderID = event.sender.id;
	  var recipientID = event.recipient.id;
	  var timeOfPostback = event.timestamp;

	  // The 'payload' param is a developer-defined field which is set in a postback 
	  // button for Structured Messages. 
	  var payload = event.postback.payload;

	  console.log("Received postback for user %d and page %d with payload '%s' " + 
	    "at %d", senderID, recipientID, payload, timeOfPostback);

	  // When a postback is called, we'll send a message back to the sender to 
	  // let them know it was successful
	  sendTextMessage(senderID, payload);
	}
};