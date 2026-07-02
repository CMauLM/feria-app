const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameNormalized: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  aliases: {
    type: [String],
    default: []
  },
  city: {
    type: String,
    trim: true,
    default: null
  },
  isConvenio: {
    type: Boolean,
    default: false,
    index: true
  },
  registeredVia: {
    type: String,
    enum: ['manual', 'bot_pending_approval'],
    default: 'manual'
  }
}, { timestamps: true });

// Función helper: quita acentos y baja a minúsculas
schoolSchema.statics.normalize = function(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Antes de guardar, auto-genera nameNormalized si no viene
schoolSchema.pre('save', function() {
  if (!this.nameNormalized) {
    this.nameNormalized = this.constructor.normalize(this.name);
  }
});

module.exports = mongoose.model('School', schoolSchema);