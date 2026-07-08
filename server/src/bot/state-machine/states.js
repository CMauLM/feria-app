// ============================================================================
// Definición de todos los estados posibles de una conversación con el bot.
// Cada estado representa "dónde va" la conversación.
// ============================================================================

const STATES = {
  // Estado inicial cuando llega el primer mensaje
  INITIAL: 'INITIAL',

  // Onboarding cliente nuevo
  ONBOARDING_NAME: 'ONBOARDING_NAME',
  ONBOARDING_EMAIL: 'ONBOARDING_EMAIL',

  // Búsqueda de escuela
  ASK_SCHOOL: 'ASK_SCHOOL',
  CONFIRM_SCHOOL: 'CONFIRM_SCHOOL',

  // Datos del alumno
  ASK_LEVEL: 'ASK_LEVEL',
  ASK_GRADE: 'ASK_GRADE',
  ASK_SEX: 'ASK_SEX',

  // Sin convenio: pide lista
  ASK_LIST: 'ASK_LIST',
  PROCESSING_LIST: 'PROCESSING_LIST',
  WAITING_LIST_APPROVAL: 'WAITING_LIST_APPROVAL',

  // Cotización
  SHOWING_QUOTE: 'SHOWING_QUOTE',
  ASK_REMOVE_ITEM: 'ASK_REMOVE_ITEM',

  // Cierre del pedido
  ASK_RECEIPT_TYPE: 'ASK_RECEIPT_TYPE',
  ASK_CSF: 'ASK_CSF',
  ASK_DELIVERY_TYPE: 'ASK_DELIVERY_TYPE',
  ASK_ADDRESS: 'ASK_ADDRESS',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  AWAITING_RECEIPT: 'AWAITING_RECEIPT',

  // Estados finales
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ABANDONED: 'ABANDONED'
};

module.exports = STATES;