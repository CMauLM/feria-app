const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');
const quoteService = require('../../quote-service');

// ============================================================================
// Handler ASK_SEX
// Último dato antes de generar cotización. Al terminar, delega en
// quote-service la búsqueda de la lista y el envío de la cotización.
// ============================================================================
async function handleAskSex(conversation, message) {
  const from = conversation.whatsappId;
  const buttonReply = message.interactive?.button_reply;

  if (!buttonReply) {
    await whatsappClient.sendText(
      from,
      'Por favor toca uno de los botones 👆'
    );
    return { nextState: STATES.ASK_SEX, contextUpdate: {} };
  }

  const sex = buttonReply.id.replace('sex_', '');

  if (!['F', 'M', 'unisex'].includes(sex)) {
    await whatsappClient.sendText(from, 'No reconocí esa opción. Intenta de nuevo tocando uno de los botones.');
    return { nextState: STATES.ASK_SEX, contextUpdate: {} };
  }

  await whatsappClient.sendText(from, 'Perfecto, dame un momento para armar tu cotización... 📋');

  return await quoteService.buildAndSendQuote(conversation, { sex });
}

module.exports = handleAskSex;