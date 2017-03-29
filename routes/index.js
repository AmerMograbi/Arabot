/*jshint esversion: 6 */

let express = require('express');
let xhub = require('express-x-hub');
let request = require('request');
let app = express();
let bodyParser = require('body-parser');
let fbMessenger = require('../lib/fb-messenger');
let database = require('../lib/database.js');


app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));


app.use(xhub({
  algorithm: 'sha1',
  secret: process.env.APP_SECRET
}));
app.use(bodyParser.json());

database.init(process.env.MONGODB_URI).then(() => {
  console.log("Successfully connected to the database.");
}).catch(err => {
  throw new Error("Cannot connect to the database. err: " + err);
});


app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});


app.post('/webhook', function(req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        let messageTosendBack;
        fbMessenger.sendBotTypingStatus(event.sender.id, "typing_on");

        if (event.message) {
          messageTosendBack = fbMessenger.receivedMessage(event);
        } else if (event.postback) {
          messageTosendBack = fbMessenger.receivedPostback(event);
        } else {
          throw new Error("Webhook received unknown event: " + event);
        }
        sendMessage(messageTosendBack);
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

app.get('/db', function(request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM users_table', function(err, result) {
      done();
      if (err) {
        console.error(err);
        response.send("Error " + err);
      } else {
        response.send(result.rows);
      }
    });
  });
});

/* GET home page. */
app.get('/', function(req, res) {
  res.send("Nothing to see here. Move along.");
});

app.get('/:showID', function(req, res) {
  res.send("the show id is: " + req.params.showID);
});

function sendMessage(messageTosendBack) {
  const isPromise = typeof messageTosendBack.then == 'function';
  if (isPromise) {
    messageTosendBack
      .then(msg => sendWithDelay(msg))
      .catch(e => {
        throw new Error("Failed to recieve message to send back due to err: " + e);
      });
  } else {
    if (messageTosendBack)
      sendWithDelay(messageTosendBack);
  }
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendWithDelay(msg) {
  const delay = getRandomIntInclusive(500, 1000);
  setTimeout(() => fbMessenger.sendMessage(msg).then(body => {
    const recipientId = body.recipient_id;
    const messageId = body.message_id;
    fbMessenger.sendBotTypingStatus(recipientId, "typing_off");

    console.log("Successfully sent message with id %s to recipient %s",
      messageId, recipientId);
  }).catch(e => {
    throw new Error("Unable to send message. messageData=" +
      JSON.stringify(msg, null, 2) + "error: " + e);
  }), delay);

}