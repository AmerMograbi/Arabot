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

try {
  database.init();
} catch (e) {
  console.log("Failed to connect to the database.");
}

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
        if (event.message) { 
          const messageTosendBack = fbMessenger.receivedMessage(event);
        } else if (event.postback) {
          const messageTosendBack = fbMessenger.receivedPostback(event); 
        } else {
          throw new Error("Webhook received unknown event: " + event);
        }
        fbMessenger.sendMessage(messageTosendBack);
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

  var reply = {
    "quick_reply": {
      "payload": "turkish series"
    },
    "mid": "mid.1488783782205:f7acced784",
    "seq": 21933,
    "text": "مسلسل تركي"
  };
  console.log(reply.quick_reply.payload);
  res.send(reply.quick_reply.payload);
});