const express = require('express');
const router = express.Router();

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
router.post('/webhook', (req, res) => {
  // Meta espera un 200 inmediato o reintenta. NO esperamos a procesar.
  res.sendStatus(200);

  // Por ahora solo logueamos el payload para ver qué llega.
  console.log('📨 Webhook recibido:');
  console.log(JSON.stringify(req.body, null, 2));

  // Aquí después va la state machine
});

module.exports = router;