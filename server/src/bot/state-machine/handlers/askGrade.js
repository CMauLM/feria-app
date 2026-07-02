const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

// ============================================================================
// Handler ASK_GRADE
// El cliente respondió con el grado. Puede venir:
// - Como button_reply (kinder o secundaria, botones)
// - Como list_reply (primaria, lista desplegable)
// ============================================================================
async function handleAskGrade(conversation, message) {
  const from = conversation.whatsappId;

  // El grado puede venir de un botón o de una lista
  const buttonReply = message.interactive?.button_reply;
  const listReply = message.interactive?.list_reply;
  const reply = buttonReply || listReply;

  if (!reply) {
    await whatsappClient.sendText(
      from,
      'Por favor elige el grado tocando uno de los botones o la lista de arriba 👆'
    );
    return { nextState: STATES.ASK_GRADE, contextUpdate: {} };
  }

  // El id tiene formato "grade_X" donde X es el número
  const grade = reply.id.replace('grade_', '');

  if (!/^[1-6]$/.test(grade)) {
    await whatsappClient.sendText(from, 'No reconocí ese grado. Intenta de nuevo tocando uno de los botones.');
    return { nextState: STATES.ASK_GRADE, contextUpdate: {} };
  }

  // Pasamos a preguntar sexo
  await whatsappClient.sendInteractiveButtons(
    from,
    'Última pregunta: ¿es niña o niño? Es para verificar la lista correcta.',
    [
      { id: 'sex_F', title: 'Niña' },
      { id: 'sex_M', title: 'Niño' },
      { id: 'sex_unisex', title: 'La misma lista' }
    ]
  );

  return {
    nextState: STATES.ASK_SEX,
    contextUpdate: {
      grade
    }
  };
}

module.exports = handleAskGrade;