const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

// ============================================================================
// Handler INITIAL
// Se ejecuta cuando la conversación acaba de arrancar (primer mensaje del cliente).
// - Si el cliente ya está registrado como Customer: saluda por nombre y pasa a preguntar escuela.
// - Si no: le da la bienvenida y le pide su nombre.
// ============================================================================
async function handleInitial(conversation, message) {
  const from = conversation.whatsappId;
  const profileName = conversation.profileName || 'amigo';

  // Por ahora, siempre asumimos cliente nuevo. Cuando conectemos con Customer real
  // vamos a checar si existe por su whatsappId y saltar el onboarding.
  await whatsappClient.sendText(
    from,
    `¡Hola ${profileName}! 👋 Soy el asistente de Dipamex. Te voy a ayudar a armar tu lista de útiles escolares. 📚\n\nPara empezar, ¿me compartes tu nombre completo?`
  );

  return {
    nextState: STATES.ONBOARDING_NAME,
    contextUpdate: {}
  };
}

module.exports = handleInitial;