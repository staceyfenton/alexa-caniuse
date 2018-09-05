const caniuse = require('caniuse-api');
const alexa = require('alexa-app');
const Speech = require('ssml-builder');

var app = new alexa.app("caniuse");

app.launch(function (request, response) {
  response.say("Hello there, tell me which feature and browser you want to check.");
  response.shouldEndSession(false);
})

app.intent("caniuse", {
  "slots": { "feature": "feature", "browser": "browser", "version": "AMAZON.NUMBER" },
  "utterances": ["Can I use {-|feature} in {-|browser} {-|version}"]
},
  function (request, response) {
    var feature = request.slots["feature"].resolutions[0].values[0].id;
    var browser = request.slots["browser"].resolutions[0].values[0].id;
    var version = request.slot("version");
    var browserVersion;

    // TODO:
    // validate version number when it does not match browser
    // make sure feature matches api

    if(!version) {
      var latestBrowsers = caniuse.getLatestStableBrowsers();
      browserVersion = latestBrowsers.filter(item => !item.indexOf(browser + " "))[0];
    } else {
      browserVersion = browser + " " + version;
    }

    var isSupported = caniuse.isSupported(feature, browserVersion);
    var support = isSupported ? "" : " not";

    var speech = new Speech()
      .say(feature + " is" + support + " supported in");

    if(browser === "ie") {
      // say IE correctly
      speech.sayAs({
        word: "ie",
        interpret: "characters"
      }).say(version);
    } else {
      speech.say(browserVersion);
    }

    speech.pause('500ms');
    speech.say("Ask another question or say done to finish.");
    
    var speechOutput = speech.ssml(true);
    response.say(speechOutput);
    response.shouldEndSession(false);
    // response.say("You asked for the feature " + feature + " and the browser " + JSON.stringify(browser));
  }
);

app.intent("AMAZON.StopIntent", {
  "utterances": ["Done"]
}, function (request, response) {
  response.say("Goodbye!");
  response.shouldEndSession(true);
});


// connect the alexa-app to AWS Lambda
exports.handler = app.lambda();
