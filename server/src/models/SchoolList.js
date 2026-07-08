const mongoose = require('mongoose');

const schoolListItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceContado: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false });

const schoolListSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  level: {
    type: String,
    enum: ['kinder', 'primaria', 'secundaria'],
    required: true
  },
  grade: {
    type: String,
    enum: ['1', '2', '3', '4', '5', '6'],
    required: true
  },
  sex: {
    type: String,
    enum: ['F', 'M', 'unisex'],
    required: true
  },
  items: {
    type: [schoolListItemSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

schoolListSchema.index({ school: 1, level: 1, grade: 1, sex: 1 }, { unique: true });

module.exports = mongoose.model('SchoolList', schoolListSchema);
