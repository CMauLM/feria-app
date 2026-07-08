const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

// ============================================================================
// Handler ASK_RECEIPT_TYPE
// El cliente confirmó su cotización y ahora decide si necesita factura.
// Si pide factura, se anota (ASK_CSF todavía no está construido) y el flujo
// sigue de todas formas a ASK_DELIVERY_TYPE — no se bloquea aquí.
// ============================================================================
async function handleAskReceiptType(conversation, message) {
  const from = conversation.whatsappId;
  const buttonReply = message.interactive?.button_reply;

  if (!buttonReply) {
    await whatsappClient.sendText(
      from,
      'Por favor toca uno de los botones 👆'
    );
    return { nextState: STATES.ASK_RECEIPT_TYPE, contextUpdate: {} };
  }

  if (!['receipt_invoice', 'receipt_none'].includes(buttonReply.id)) {
    await whatsappClient.sendText(from, 'No reconocí esa opción. Intenta de nuevo tocando uno de los botones.');
    return { nextState: STATES.ASK_RECEIPT_TYPE, contextUpdate: {} };
  }

  const requiresInvoice = buttonReply.id === 'receipt_invoice';

  if (requiresInvoice) {
    await whatsappClient.sendText(
      from,
      'Anotado. Más adelante un ejecutivo te pedirá tu constancia de situación fiscal para la factura. 🧾'
    );
  }

  await whatsappClient.sendInteractiveButtons(
    from,
    '¿Cómo quieres tu pedido?',
    [
      { id: 'delivery_recoger', title: 'Recoger en tienda' },
      { id: 'delivery_domicilio', title: 'A domicilio' }
    ]
  );

  return {
    nextState: STATES.ASK_DELIVERY_TYPE,
    contextUpdate: { requiresInvoice }
  };
}

module.exports = handleAskReceiptType;
