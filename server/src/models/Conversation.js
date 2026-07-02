const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  whatsappId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  profileName: {
    type: String,
    trim: true,
    default: null
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  currentState: {
    type: String,
    required: true,
    default: 'INITIAL'
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

conversationSchema.index({ lastMessageAt: 1, isActive: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);