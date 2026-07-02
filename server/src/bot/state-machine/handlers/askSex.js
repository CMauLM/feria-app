const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

const SEX_LABELS = {
  F: 'niña',
  M: 'niño',
  unisex: 'la misma lista'
};

// ============================================================================
// Handler ASK_SEX
// Último dato antes de generar cotización.
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

  // Ya tenemos todos los datos. Mostramos un resumen temporal.
  // TODO: en el siguiente paso implementamos la búsqueda de la lista y la cotización.
  const ctx = { ...conversation.context, sex };
  const summary = `Perfecto, todo listo para armar tu cotización. Estos son los datos:\n\n` +
    `👤 Cliente: ${ctx.customerName}\n` +
    `📧 Correo: ${ctx.customerEmail}\n` +
    `🏫 Escuela: ${ctx.schoolName}\n` +
    `📚 Nivel: ${ctx.level}\n` +
    `🔢 Grado: ${ctx.grade}°\n` +
    `👶 Para: ${SEX_LABELS[sex]}\n\n` +
    `En un momento te mando tu cotización...`;

  await whatsappClient.sendText(from, summary);

  return {
    nextState: STATES.SHOWING_QUOTE,
    contextUpdate: { sex }
  };
}

module.exports = handleAskSex;