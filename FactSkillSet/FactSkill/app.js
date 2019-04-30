const Alexa = require('ask-sdk-core');

const facts = [
        'A year on Mercury is just 88 days long.',
        'Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.',
        'On Mars, the Sun appears about half the size as it does on Earth.',
        'Jupiter has the shortest day of all the planets.',
        'The Sun is an almost perfect sphere.',
      ];
      
var randomItem = facts[Math.floor(Math.random()*facts.length)];

const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    // concatenates a standard message with the random fact
    const speakOutput = 'here is your fact ' + randomItem;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
}


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler
  )
  .lambda();
