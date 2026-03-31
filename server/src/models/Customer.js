const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  company: {
    type: String,
    trim: true,
    default: null
  },
  rfc: {
    type: String,
    trim: true,
    uppercase: true,
    default: null
  },
  customerCode: {
  type: String,
  unique: true,
  default: null
},
  paymentType: {
    type: String,
    enum: ['contado', 'credito'],
    required: true,
    default: 'contado'
  },
  personType: {
  type: String,
  enum: ['fisica', 'moral'],
  default: 'fisica'
},
  deliveryDate: {
    type: Date,
    required: true
  
  },
  requiresInvoice: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);