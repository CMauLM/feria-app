const STATES = require('../states');
const whatsappClient = require('../../whatsapp-client');
const { matchSchool } = require('../../school-matcher');

// ============================================================================
// Handler ASK_SCHOOL
// El cliente respondió con el nombre de su escuela.
// - Si hay match único: confirma y pasa a preguntar nivel.
// - Si hay varios matches: muestra opciones para que elija.
// - Si no hay match: pasa al flujo sin convenio (todavía sin implementar).
// ============================================================================
async function handleAskSchool(conversation, message) {
  const from = conversation.whatsappId;
  const text = (message.text?.body || '').trim();

  if (text.length < 3) {
    await whatsappClient.sendText(
      from,
      'No alcancé a leer bien el nombre. ¿Me lo puedes escribir de nuevo, por favor?'
    );
    return { nextState: STATES.ASK_SCHOOL, contextUpdate: {} };
  }

  const result = await matchSchool(text);

  if (result.type === 'EXACT_MATCH') {
    const school = result.matches[0];
    await whatsappClient.sendInteractiveButtons(
      from,
      `Encontré tu escuela: *${school.name}*. ¿Es esa?`,
      [
        { id: `school_confirm_${school._id}`, title: 'Sí, es esa' },
        { id: 'school_reject', title: 'No, es otra' }
      ]
    );
    return {
      nextState: STATES.CONFIRM_SCHOOL,
      contextUpdate: {
        schoolCandidateId: school._id.toString()
      }
    };
  }

  if (result.type === 'MULTIPLE_MATCHES') {
    // Presentamos hasta 3 opciones como botones
    const buttons = result.matches.slice(0, 3).map((school, i) => ({
      id: `school_confirm_${school._id}`,
      title: school.name.length > 20 ? school.name.substring(0, 18) + '..' : school.name
    }));

    await whatsappClient.sendInteractiveButtons(
      from,
      'Encontré varias escuelas parecidas. ¿Cuál es la tuya?',
      buttons
    );
    return {
      nextState: STATES.CONFIRM_SCHOOL,
      contextUpdate: {
        schoolCandidates: result.matches.map(s => s._id.toString())
      }
    };
  }

  // NO_MATCH: por ahora solo avisamos, el flujo sin convenio va después
  await whatsappClient.sendText(
    from,
    `No encontré tu escuela en nuestros convenios. Estamos trabajando en agregarla, por ahora un ejecutivo te contactará. 🙏`
  );
  return {
    nextState: STATES.ABANDONED,  // temporal, después será el flujo sin convenio
    contextUpdate: { schoolInputRaw: text }
  };
}

module.exports = handleAskSchool;