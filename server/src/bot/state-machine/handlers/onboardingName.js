const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

// ============================================================================
// Handler ONBOARDING_NAME
// El cliente acaba de responder al saludo con su nombre.
// Guardamos el nombre en el contexto y pasamos a pedirle el correo.
// ============================================================================
async function handleOnboardingName(conversation, message) {
  const from = conversation.whatsappId;
  const text = (message.text?.body || '').trim();

  // Validación básica: que haya escrito algo razonable como nombre
  if (text.length < 2) {
    await whatsappClient.sendText(
      from,
      'No alcancé a leer tu nombre. ¿Me lo puedes escribir de nuevo, por favor?'
    );
    return {
      nextState: STATES.ONBOARDING_NAME,  // se queda en el mismo estado
      contextUpdate: {}
    };
  }

  // Guardamos el nombre y pedimos el correo
  await whatsappClient.sendText(
    from,
    `Gracias ${text.split(' ')[0]}. 📧 Ahora, ¿me compartes tu correo electrónico? Es para enviarte la cotización y la factura si la necesitas.`
  );

  return {
    nextState: STATES.ONBOARDING_EMAIL,
    contextUpdate: {
      customerName: text
    }
  };
}

module.exports = handleOnboardingName;