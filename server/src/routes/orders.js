const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/orders — crear nueva orden
router.post('/', protect, async (req, res) => {
  try {
    const { customerId, items } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: 'El cliente es requerido' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'La orden debe tener al menos un producto' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const paymentType = customer.paymentType;
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
      }

      const appliedPrice = paymentType === 'contado' ? product.priceContado : product.priceCredito;
      const subtotal = appliedPrice * item.quantity;
      total += subtotal;

      orderItems.push({
        product: product._id,
        barcode: product.barcode,
        name: product.name,
        priceContado: product.priceContado,
        priceCredito: product.priceCredito,
        appliedPrice,
        quantity: item.quantity,
        subtotal,
        notes: item.notes || ''
      });
    }

    const order = await Order.create({
      stand: req.user.stand || req.body.stand || 'Admin',
      vendorUser: req.user._id,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        customerCode: customer.customerCode,
        paymentType: customer.paymentType,
        deliveryDate: customer.deliveryDate,
        requiresInvoice: customer.requiresInvoice
      },
      items: orderItems,
      total,
      status: 'confirmed'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders — listar órdenes
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.query.stand) filter.stand = req.query.stand;
    if (req.query.paymentType) filter['customer.paymentType'] = req.query.paymentType;
    if (req.query.requiresInvoice) filter['customer.requiresInvoice'] = req.query.requiresInvoice === 'true';
    if (req.query.status) filter.status = req.query.status;
if (req.query.customer) {
  filter.$or = [
    { 'customer.name': { $regex: req.query.customer, $options: 'i' } },
    { 'customer.customerCode': { $regex: req.query.customer, $options: 'i' } }
  ];
}
    if (req.user.role === 'vendor') {
      filter.vendorUser = req.user._id;
    }

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const orders = await Order.find(filter)
      .sort({ [sortField]: sortOrder })
      .populate('vendorUser', 'name stand');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id — detalle de una orden
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('vendorUser', 'name stand');

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/orders/:id — eliminar orden (solo admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;