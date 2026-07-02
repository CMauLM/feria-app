const express = require('express');
const router = express.Router();
const whatsappClient = require('./whatsapp-client');
const Conversation = require('../models/Conversation');
const stateRouter = require('./state-machine/router');
const STATES = require('./state-machine/states');

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

// GET /bot/webhook — verificación inicial de Meta
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

// POST /bot/webhook — recibe mensajes entrantes y los pasa a la state machine
router.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) return;

    const from = message.from;
    const profileName = value.contacts?.[0]?.profile?.name || null;

    console.log(`📩 Mensaje de ${profileName || 'desconocido'} (${from})`);

    // Buscar o crear la conversación
    let conversation = await Conversation.findOne({ whatsappId: from });

    if (!conversation) {
      conversation = await Conversation.create({
        whatsappId: from,
        profileName,
        currentState: STATES.INITIAL,
        context: {}
      });
      console.log(`🆕 Nueva conversación creada para ${from}`);
    } else if (profileName && conversation.profileName !== profileName) {
      // Actualizar el nombre de perfil si cambió
      conversation.profileName = profileName;
    }

    // Ejecutar handler del estado actual
    const { nextState, contextUpdate } = await stateRouter.route(conversation, message);

    // Actualizar la conversación en DB
    conversation.currentState = nextState;
    conversation.context = { ...conversation.context, ...contextUpdate };
    conversation.lastMessageAt = new Date();
    await conversation.save();

    console.log(`➡️  Estado: ${conversation.currentState}`);

  } catch (error) {
    console.error('Error procesando webhook:', error);
  }
});

module.exports = router;