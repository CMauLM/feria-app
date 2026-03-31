const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sku: {
    type: String,
    trim: true,
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  priceContado: {
    type: Number,
    required: true,
    min: 0
  },
  priceCredito: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String,
    trim: true,
    default: null
  },
  unit: {
    type: String,
    trim: true,
    default: 'pieza'
  }
}, { timestamps: true });

productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);