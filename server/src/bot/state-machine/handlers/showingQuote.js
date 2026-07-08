const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

// ============================================================================
// Handler SHOWING_QUOTE
// El cliente respondió a los botones de la cotización.
// - Confirmar: pasa al cierre del pedido (item 4, aún sin handlers propios).
// - Agregar: por ahora se deja para un ejecutivo (la lista de convenio es la
//   que pidió la escuela, agregar algo fuera de ella es poco frecuente).
// - Quitar: manda la lista numerada en texto y pasa a ASK_REMOVE_ITEM.
// ============================================================================
async function handleShowingQuote(conversation, message) {
  const from = conversation.whatsappId;
  const buttonReply = message.interactive?.button_reply;

  if (!buttonReply) {
    await whatsappClient.sendText(
      from,
      'Por favor toca uno de los botones de la cotización 👆'
    );
    return { nextState: STATES.SHOWING_QUOTE, contextUpdate: {} };
  }

  if (buttonReply.id === 'quote_confirm') {
    await whatsappClient.sendText(from, '¡Perfecto! Vamos a cerrar tu pedido. 🧾');
    return { nextState: STATES.ASK_RECEIPT_TYPE, contextUpdate: {} };
  }

  if (buttonReply.id === 'quote_add') {
    await whatsappClient.sendText(
      from,
      'Para agregar algo fuera de tu lista, un ejecutivo te va a contactar en breve. 🙏'
    );
    return { nextState: STATES.SHOWING_QUOTE, contextUpdate: {} };
  }

  if (buttonReply.id === 'quote_remove') {
    const quoteItems = conversation.context.quoteItems || [];

    const listText = quoteItems
      .map((item, i) => `${i + 1}. ${item.name} (x${item.quantity})`)
      .join('\n');

    await whatsappClient.sendText(
      from,
      `¿Cuál producto quieres quitar? Escribe el número:\n\n${listText}`
    );

    return { nextState: STATES.ASK_REMOVE_ITEM, contextUpdate: {} };
  }

  await whatsappClient.sendText(from, 'No reconocí esa opción. Por favor toca uno de los botones 👆');
  return { nextState: STATES.SHOWING_QUOTE, contextUpdate: {} };
}

module.exports = handleShowingQuote;
