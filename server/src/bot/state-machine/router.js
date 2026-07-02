const STATES = require('./states');
const initialHandler = require('./handlers/initial');
const onboardingNameHandler = require('./handlers/onboardingName');
const onboardingEmailHandler = require('./handlers/onboardingEmail');
const askSchoolHandler = require('./handlers/askSchool');


const handlers = {
  [STATES.INITIAL]: initialHandler,
  [STATES.ONBOARDING_NAME]: onboardingNameHandler,
  [STATES.ONBOARDING_EMAIL]: onboardingEmailHandler,
  [STATES.ASK_SCHOOL]: askSchoolHandler,
};

async function route(conversation, message) {
  const handler = handlers[conversation.currentState];

  if (!handler) {
    console.warn(`⚠️  No hay handler para estado: ${conversation.currentState}`);
    return { nextState: conversation.currentState, contextUpdate: {} };
  }

  return await handler(conversation, message);
}

module.exports = { route };