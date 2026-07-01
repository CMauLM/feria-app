const express = require('express');
const router = express.Router();
const whatsappClient = require('./whatsapp-client');

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

// ============================================================================
// GET /bot/webhook
// Meta llama aquí una vez al momento de configurar el webhook para verificar
// que el endpoint es nuestro.
// ============================================================================
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado por Meta');
    return res.status(200).send(challenge);
  }

  console.log('❌ Webhook falló verificación');
  return res.sendStatus(403);
});

// ============================================================================
// POST /bot/webhook
// Meta manda aquí cada mensaje entrante del cliente y cada actualización de
// estado de mensajes que enviamos.
// ============================================================================
router.post('/webhook', async (req, res) => {
  // Meta espera un 200 inmediato
  res.sendStatus(200);

  try {
    // Extraer el mensaje si viene uno
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // No es un mensaje entrante, puede ser un status update, lo ignoramos
      return;
    }

    const from = message.from;
    const text = message.text?.body || '';
    const profileName = value.contacts?.[0]?.profile?.name || 'cliente';

    console.log(`📩 Mensaje de ${profileName} (${from}): "${text}"`);

    // Respuesta eco de prueba
    await whatsappClient.sendText(
      from,
      `Hola ${profileName} 👋 Recibí tu mensaje: "${text}". Este es el bot de Dipamex respondiendo.`
    );

  } catch (error) {
    console.error('Error procesando webhook:', error);
  }
});

module.exports = router;