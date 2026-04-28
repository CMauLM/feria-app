const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  barcode: String,
  name: String,
  priceContado: Number,
  priceCredito: Number,
  appliedPrice: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: Number,
  notes: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  stand: {
    type: String,
    required: true
  },
  vendorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    customerCode: String,
    paymentType: String,
    deliveryDate: Date,
    requiresInvoice: Boolean
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['open', 'confirmed'],
    default: 'confirmed'
  }
}, { timestamps: true });

orderSchema.pre('save', async function() {
  if (this.orderNumber) return;
  const count = await mongoose.model('Order').countDocuments();
  this.orderNumber = `ORD-${String(count + 1).padStart(3, '0')}`;
});

module.exports = mongoose.model('Order', orderSchema);