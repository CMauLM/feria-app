const STATES = require('./states');
const initialHandler = require('./handlers/initial');

// ============================================================================
// Diccionario que mapea estado → handler
// A medida que agreguemos handlers, se van agregando aquí.
// ============================================================================
const handlers = {
  [STATES.INITIAL]: initialHandler,
  // [STATES.ONBOARDING_NAME]: onboardingNameHandler,
  // [STATES.ASK_SCHOOL]: askSchoolHandler,
  // ...
};

// ============================================================================
// Ejecuta el handler correspondiente al estado actual de la conversación.
// Cada handler recibe (conversation, message) y devuelve el siguiente estado
// junto con actualizaciones al contexto.
// ============================================================================
async function route(conversation, message) {
  const handler = handlers[conversation.currentState];

  if (!handler) {
    console.warn(`⚠️  No hay handler para estado: ${conversation.currentState}`);
    return { nextState: conversation.currentState, contextUpdate: {} };
  }

  return await handler(conversation, message);
}

module.exports = { route };