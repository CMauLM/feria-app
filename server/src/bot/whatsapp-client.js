const axios = require('axios');

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const API_URL = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

// Cliente axios pre-configurado con el token de autenticación
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// ============================================================================
// sendText - manda un mensaje de texto libre a un cliente
// ============================================================================
async function sendText(to, body) {
  try {
    const response = await client.post('', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body }
    });
    console.log(`✅ Mensaje enviado a ${to}: "${body.substring(0, 50)}..."`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error enviando a ${to}:`, error.response?.data || error.message);
    throw error;
  }
}

// ============================================================================
// sendInteractiveButtons - manda mensaje con hasta 3 botones de respuesta
// ============================================================================
async function sendInteractiveButtons(to, bodyText, buttons) {
  // buttons: [{ id: 'confirm', title: 'Confirmar' }, ...]
  try {
    const response = await client.post('', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: { id: b.id, title: b.title }
          }))
        }
      }
    });
    console.log(`✅ Botones enviados a ${to}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error enviando botones a ${to}:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendText,
  sendInteractiveButtons
};