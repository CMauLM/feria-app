const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

// ============================================================================
// Handler ASK_DELIVERY_TYPE
// El cliente eligió cómo quiere su pedido.
// - Recoger: no hace falta dirección, pasa directo a AWAITING_PAYMENT.
// - Domicilio: pide la dirección, pasa a ASK_ADDRESS.
// ============================================================================
async function handleAskDeliveryType(conversation, message) {
  const from = conversation.whatsappId;
  const buttonReply = message.interactive?.button_reply;

  if (!buttonReply) {
    await whatsappClient.sendText(
      from,
      'Por favor toca uno de los botones 👆'
    );
    return { nextState: STATES.ASK_DELIVERY_TYPE, contextUpdate: {} };
  }

  if (buttonReply.id === 'delivery_domicilio') {
    await whatsappClient.sendText(
      from,
      'Perfecto. Escríbeme tu dirección completa (calle, número, colonia y referencias). 📍'
    );
    return {
      nextState: STATES.ASK_ADDRESS,
      contextUpdate: { deliveryType: 'domicilio' }
    };
  }

  if (buttonReply.id === 'delivery_recoger') {
    await whatsappClient.sendText(
      from,
      '🧾 Anotado. En breve te compartimos cómo pagar tu anticipo de $100. ¡Gracias por tu compra!'
    );
    return {
      nextState: STATES.AWAITING_PAYMENT,
      contextUpdate: { deliveryType: 'recoger' }
    };
  }

  await whatsappClient.sendText(from, 'No reconocí esa opción. Intenta de nuevo tocando uno de los botones.');
  return { nextState: STATES.ASK_DELIVERY_TYPE, contextUpdate: {} };
}

module.exports = handleAskDeliveryType;
