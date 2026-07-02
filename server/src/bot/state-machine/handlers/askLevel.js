const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');

// Grados disponibles por nivel (los mostramos como botones después)
const GRADES_BY_LEVEL = {
  kinder: ['1', '2', '3'],
  primaria: ['1', '2', '3', '4', '5', '6'],
  secundaria: ['1', '2', '3']
};

const LEVEL_LABELS = {
  kinder: 'Kinder',
  primaria: 'Primaria',
  secundaria: 'Secundaria'
};

// ============================================================================
// Handler ASK_LEVEL
// El cliente respondió con el nivel escolar.
// ============================================================================
async function handleAskLevel(conversation, message) {
  const from = conversation.whatsappId;
  const buttonReply = message.interactive?.button_reply;

  if (!buttonReply) {
    await whatsappClient.sendText(
      from,
      'Por favor tócale a uno de los botones para elegir nivel 👆'
    );
    return { nextState: STATES.ASK_LEVEL, contextUpdate: {} };
  }

  const level = buttonReply.id.replace('level_', ''); // kinder, primaria, secundaria

  if (!GRADES_BY_LEVEL[level]) {
    await whatsappClient.sendText(from, 'No reconocí ese nivel. Intenta de nuevo tocando uno de los botones.');
    return { nextState: STATES.ASK_LEVEL, contextUpdate: {} };
  }

  // Mostrar los grados posibles como botones (Meta permite máximo 3 botones interactive,
  // así que para primaria vamos a mandar mensaje con lista en lugar de botones)
  const grades = GRADES_BY_LEVEL[level];

  if (grades.length <= 3) {
    // Botones directos
    const buttons = grades.map(g => ({
      id: `grade_${g}`,
      title: `${g}°`
    }));

    await whatsappClient.sendInteractiveButtons(
      from,
      `Perfecto, ${LEVEL_LABELS[level]}. ¿Qué grado?`,
      buttons
    );
  } else {
    // Lista interactiva (primaria, 6 grados)
    const rows = grades.map(g => ({
      id: `grade_${g}`,
      title: `${g}° de primaria`
    }));

    await whatsappClient.sendInteractiveList(
      from,
      `Perfecto, ${LEVEL_LABELS[level]}. ¿Qué grado cursa?`,
      'Ver grados',
      [{ title: 'Grados de primaria', rows }]
    );
  }

  return {
    nextState: STATES.ASK_GRADE,
    contextUpdate: {
      level
    }
  };
}

module.exports = handleAskLevel;