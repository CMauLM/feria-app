const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');
const quoteService = require('../../quote-service');

// ============================================================================
// Handler ASK_REMOVE_ITEM
// El cliente respondió con el número del producto que quiere quitar de su
// cotización (ver showingQuote.js, que mandó la lista numerada en texto).
// ============================================================================
async function handleAskRemoveItem(conversation, message) {
  const from = conversation.whatsappId;
  const text = (message.text?.body || '').trim();
  const quoteItems = conversation.context.quoteItems || [];

  const index = parseInt(text, 10) - 1;

  if (isNaN(index) || index < 0 || index >= quoteItems.length) {
    await whatsappClient.sendText(
      from,
      `No reconocí ese número. Escribe uno del 1 al ${quoteItems.length}.`
    );
    return { nextState: STATES.ASK_REMOVE_ITEM, contextUpdate: {} };
  }

  if (quoteItems.length === 1) {
    await whatsappClient.sendText(
      from,
      'Ese es el único producto que te queda en la cotización, no lo puedo quitar. Si ya no quieres continuar, un ejecutivo te puede ayudar.'
    );
    return { nextState: STATES.SHOWING_QUOTE, contextUpdate: {} };
  }

  const removed = quoteItems[index];
  const updatedItems = quoteItems.filter((_, i) => i !== index);

  await whatsappClient.sendText(from, `Listo, quité *${removed.name}* de tu cotización. 🗑️`);

  return await quoteService.resendQuote(conversation, { quoteItems: updatedItems });
}

module.exports = handleAskRemoveItem;
