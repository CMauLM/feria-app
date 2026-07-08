const STATES = require('./state-machine/states');
const whatsappClient = require('./whatsapp-client');
const SchoolList = require('../models/SchoolList');
const { buildQuotePdf } = require('./pdf-generator');

const IVA_RATE = 0.16;

const LEVEL_LABELS = {
  kinder: 'Kinder',
  primaria: 'Primaria',
  secundaria: 'Secundaria'
};

const SEX_LABELS = {
  F: 'Niña',
  M: 'Niño',
  unisex: 'Unisex'
};

// ============================================================================
// findSchoolList - busca la lista exacta (escuela+nivel+grado+sexo). Si no hay
// coincidencia exacta de sexo, hace fallback a 'unisex' antes de rendirse.
// ============================================================================
async function findSchoolList({ schoolId, level, grade, sex }) {
  const baseQuery = { school: schoolId, level, grade, isActive: true };

  let list = await SchoolList.findOne({ ...baseQuery, sex }).populate('items.product');

  if (!list && sex !== 'unisex') {
    list = await SchoolList.findOne({ ...baseQuery, sex: 'unisex' }).populate('items.product');
  }

  return list;
}

// ============================================================================
// sendQuoteMessages - arma el PDF y manda los 3 mensajes (documento, texto con
// total, botones) a partir de un arreglo de quoteItems ya resuelto. Compartido
// entre el primer envío y los reenvíos tras modificar la cotización.
// ============================================================================
async function sendQuoteMessages(from, ctx, quoteItems) {
  const { schoolName, level, grade, sex } = ctx;

  const items = quoteItems.map(item => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.priceContado,
    subtotal: item.priceContado * item.quantity
  }));

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  const pdfBuffer = await buildQuotePdf({
    schoolName,
    levelLabel: LEVEL_LABELS[level],
    grade,
    sexLabel: SEX_LABELS[sex],
    items,
    subtotal,
    iva,
    total
  });

  const mediaId = await whatsappClient.uploadMedia(pdfBuffer, 'cotizacion.pdf', 'application/pdf');
  await whatsappClient.sendDocument(from, mediaId, 'cotizacion.pdf', 'Aquí tienes tu cotización 📄');

  await whatsappClient.sendText(
    from,
    `💰 Total: $${total.toFixed(2)}\n💵 Anticipo: $100.00\n\nEl resto se paga al recoger o al entregar tu pedido.`
  );

  await whatsappClient.sendInteractiveButtons(
    from,
    '¿Qué quieres hacer con esta cotización?',
    [
      { id: 'quote_confirm', title: 'Confirmar' },
      { id: 'quote_add', title: 'Agregar' },
      { id: 'quote_remove', title: 'Quitar' }
    ]
  );

  return total;
}

// ============================================================================
// buildAndSendQuote - primer envío: busca la SchoolList, copia sus items a
// conversation.context.quoteItems (copia propia de esta conversación, para
// que Agregar/Quitar nunca toquen la lista maestra de la escuela) y manda la
// cotización. Se llama desde askSex, ya que el router solo re-invoca handlers
// cuando llega un mensaje nuevo del cliente.
// ============================================================================
async function buildAndSendQuote(conversation, extraContext = {}) {
  const from = conversation.whatsappId;
  const ctx = { ...conversation.context, ...extraContext };
  const { schoolId, schoolName, level, grade, sex } = ctx;

  const list = await findSchoolList({ schoolId, level, grade, sex });

  if (!list) {
    await whatsappClient.sendText(
      from,
      `Aún no tengo cargada la lista de *${schoolName}* para ${grade}° de ${LEVEL_LABELS[level]} (${SEX_LABELS[sex]}). 📋\n\n` +
      `Mándame una foto, PDF o el texto de tu lista de útiles y en breve la cotizamos.`
    );
    return {
      nextState: STATES.ASK_LIST,
      contextUpdate: { sex }
    };
  }

  const quoteItems = list.items.map(item => ({
    productId: item.product._id.toString(),
    name: item.product.name,
    quantity: item.quantity,
    priceContado: item.priceContado
  }));

  const total = await sendQuoteMessages(from, ctx, quoteItems);

  return {
    nextState: STATES.SHOWING_QUOTE,
    contextUpdate: {
      sex,
      schoolListId: list._id.toString(),
      quoteItems,
      quoteTotal: total
    }
  };
}

// ============================================================================
// resendQuote - reenvía la cotización a partir de conversation.context.quoteItems
// ya existente (por ejemplo, después de quitar un producto). No vuelve a
// consultar la SchoolList maestra.
// ============================================================================
async function resendQuote(conversation, extraContext = {}) {
  const from = conversation.whatsappId;
  const ctx = { ...conversation.context, ...extraContext };

  const total = await sendQuoteMessages(from, ctx, ctx.quoteItems);

  return {
    nextState: STATES.SHOWING_QUOTE,
    contextUpdate: { quoteItems: ctx.quoteItems, quoteTotal: total }
  };
}

module.exports = { buildAndSendQuote, resendQuote };
