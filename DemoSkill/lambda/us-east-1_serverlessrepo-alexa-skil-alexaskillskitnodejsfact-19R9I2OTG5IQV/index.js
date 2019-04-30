/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const AWS = require("aws-sdk");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'LaunchRequest'
      && request.intent.name === 'HelloWorldIntent');
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hello World!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const GetAllDetectedObjects = function () {
  return new Promise((resolve, reject) => {
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
      TableName: 'tripLog'
    };

    var items = [];

    var scanExecute = function () {
      docClient.scan(params, function (err, result) {

        if (err) {
          reject(err);
        }
        else {
          items = items.concat(result.Items);

          console.log("     Read " + result.Count + " items");
          if (result.LastEvaluatedKey) {

            params.ExclusiveStartKey = result.LastEvaluatedKey;
            console.log("     Starting next page scan...");
            scanExecute();
          }
          else {
            console.log("End of scanning - retrieved " + items.length + " items in total");
            resolve(items);
          }
        }
      });
    }
    console.log("Starting initial scan...")
    scanExecute();
  });
};
const loadLogRecords = handlerInput => {
  return new Promise(resolve => {
    GetAllDetectedObjects().then(results => {
      if (results.length > 0) {
        // Get the most-recently detected object
        var mostRecentlyDetected = results[results.length -1];

        console.log(`Most recently detected object was ${mostRecentlyDetected.objectLabel}`);

        var timesDectectedWords = mostRecentlyDetected.detectionCount > 1 ? ` ${mostRecentlyDetected.detectionCount} times` : "only once."
        resolve(
          handlerInput.responseBuilder
            .speak(`The most recently detected item was a ${mostRecentlyDetected.tourDest} and that was 5 ago. It has been detected a total of ${timesDectectedWords}`)
            .getResponse()
        );
      }
      else {
        resolve(
          handlerInput.responseBuilder
            .speak("There haven't been any recently detected objects.")
            .getResponse()
        );
      }
    })
      .catch((err) => {
        console.log(err);

        resolve(
          handlerInput.responseBuilder
            .speak("Oops, something went wrong!")
            .getResponse()
        );
      });
  })
};

const GetLastDestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'LaunchRequest'
      || request.type === 'IntentRequest')
      && request.intent.name === 'MostRecentlyLoggedDest';
  },
  handle(handlerInput) {
    return loadLogRecords(handlerInput);
  },
};

const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && (request.intent.name === 'GetNewFactIntent' || request.intent.name === 'AMAZON.YesIntent'));
  },
  handle(handlerInput) {
    const factArr = data;
    const factIndex = Math.floor(Math.random() * factArr.length);
    const randomFact = factArr[factIndex];
    const speechOutput = GET_FACT_MESSAGE + randomFact;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, randomFact)
      .reprompt('Do you want another fact')
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Daily Facts';
const GET_FACT_MESSAGE = 'Hans tells you that: ';
const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const data = [
  'A year on Mercury is just 88 days long.',
  'Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.',
  'Venus rotates counter-clockwise, possibly because of a collision in the past with an asteroid.',
  'On Mars, the Sun appears about half the size as it does on Earth.',
  'Earth is the only planet not named after a god.',
  'Jupiter has the shortest day of all the planets.',
  'The Milky Way galaxy will collide with the Andromeda Galaxy in about 5 billion years.',
  'The Sun contains 99.86% of the mass in the Solar System.',
  'The Sun is an almost perfect sphere.',
  'A total solar eclipse can happen once every 1 to 2 years. This makes them a rare event.',
  'Saturn radiates two and a half times more energy into space than it receives from the sun.',
  'The temperature inside the Sun can reach 15 million degrees Celsius.',
  'The Moon is moving approximately 3.8 cm away from our planet every year.',
];

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    GetLastDestHandler,
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
