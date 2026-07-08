const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

// ============================================================================
// Handler ASK_ADDRESS
// El cliente respondió con su dirección para entrega a domicilio.
// ============================================================================
async function handleAskAddress(conversation, message) {
  const from = conversation.whatsappId;
  const text = (message.text?.body || '').trim();

  if (text.length < 10) {
    await whatsappClient.sendText(
      from,
      'Esa dirección me quedó muy corta. ¿Me la puedes escribir completa? (calle, número, colonia y referencias)'
    );
    return { nextState: STATES.ASK_ADDRESS, contextUpdate: {} };
  }

  await whatsappClient.sendText(
    from,
    '🧾 Anotado. En breve te compartimos cómo pagar tu anticipo de $100. ¡Gracias por tu compra!'
  );

  return {
    nextState: STATES.AWAITING_PAYMENT,
    contextUpdate: { address: text }
  };
}

module.exports = handleAskAddress;
