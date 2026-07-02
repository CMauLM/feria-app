const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// Handler ONBOARDING_EMAIL
// El cliente respondió con su correo. Validamos el formato y pasamos a
// preguntar por la escuela.
// ============================================================================
async function handleOnboardingEmail(conversation, message) {
  const from = conversation.whatsappId;
  const text = (message.text?.body || '').trim().toLowerCase();

  // Validar formato
  if (!EMAIL_REGEX.test(text)) {
    await whatsappClient.sendText(
      from,
      'Ese correo no me pareció válido. ¿Me lo puedes escribir de nuevo? Ejemplo: nombre@correo.com'
    );
    return {
      nextState: STATES.ONBOARDING_EMAIL,
      contextUpdate: {}
    };
  }

  const firstName = conversation.context.customerName?.split(' ')[0] || 'amigo';

  await whatsappClient.sendText(
    from,
    `¡Perfecto ${firstName}! 🏫 Ahora dime, ¿de qué escuela vas a comprar los útiles? Escríbeme el nombre.`
  );

  return {
    nextState: STATES.ASK_SCHOOL,
    contextUpdate: {
      customerEmail: text
    }
  };
}

module.exports = handleOnboardingEmail;