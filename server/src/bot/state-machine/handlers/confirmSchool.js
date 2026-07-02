const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');
const School = require('../../../models/School');

// ============================================================================
// Handler CONFIRM_SCHOOL
// El cliente respondió a los botones que le mandamos para confirmar la escuela.
// Los botones pueden ser:
//   - "Sí, es esa" (id: school_confirm_<schoolId>)
//   - "No, es otra" (id: school_reject)
//   - Un nombre de escuela específica (id: school_confirm_<schoolId>) cuando eran múltiples
// ============================================================================
async function handleConfirmSchool(conversation, message) {
  const from = conversation.whatsappId;

  // La respuesta del botón viene en interactive.button_reply.id
  const buttonReply = message.interactive?.button_reply;

  if (!buttonReply) {
    // El cliente escribió texto en vez de tocar botón. Le pedimos que use los botones.
    await whatsappClient.sendText(
      from,
      'Por favor tócale a uno de los botones que te mandé arriba 👆'
    );
    return { nextState: STATES.CONFIRM_SCHOOL, contextUpdate: {} };
  }

  const buttonId = buttonReply.id;

  // Caso "No, es otra" → volvemos a preguntar la escuela
  if (buttonId === 'school_reject') {
    await whatsappClient.sendText(
      from,
      'Sin problema. Escríbeme de nuevo el nombre de tu escuela, dame un poco más de detalle esta vez. 🏫'
    );
    return {
      nextState: STATES.ASK_SCHOOL,
      contextUpdate: {
        schoolCandidateId: null,
        schoolCandidates: null
      }
    };
  }

  // Caso "Sí, es esa" o eligió uno de los múltiples matches
  if (buttonId.startsWith('school_confirm_')) {
    const schoolId = buttonId.replace('school_confirm_', '');
    const school = await School.findById(schoolId);

    if (!school) {
      await whatsappClient.sendText(
        from,
        'Algo raro pasó buscando tu escuela. Intentemos de nuevo, escríbeme el nombre.'
      );
      return { nextState: STATES.ASK_SCHOOL, contextUpdate: {} };
    }

    // Guardamos la escuela y pasamos a preguntar nivel
    await whatsappClient.sendInteractiveButtons(
      from,
      `¡Listo! Registré tu escuela como *${school.name}*. 📚\n\n¿Qué nivel cursa tu hijo o hija?`,
      [
        { id: 'level_kinder', title: 'Kinder' },
        { id: 'level_primaria', title: 'Primaria' },
        { id: 'level_secundaria', title: 'Secundaria' }
      ]
    );

    return {
      nextState: STATES.ASK_LEVEL,
      contextUpdate: {
        schoolId: school._id.toString(),
        schoolName: school.name,
        schoolCandidateId: null,
        schoolCandidates: null
      }
    };
  }

  // Botón desconocido, fallback
  await whatsappClient.sendText(
    from,
    'No entendí tu respuesta. ¿Puedes tocar uno de los botones de arriba? 👆'
  );
  return { nextState: STATES.CONFIRM_SCHOOL, contextUpdate: {} };
}

module.exports = handleConfirmSchool;