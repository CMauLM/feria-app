const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/export/orders — exportar órdenes a Excel
router.get('/orders', protect, adminOnly, async (req, res) => {
  try {
    const filter = {};

    // Mismos filtros que el dashboard
    if (req.query.stand) filter.stand = req.query.stand;
    if (req.query.paymentType) filter.paymentType = req.query.paymentType;
    if (req.query.requiresInvoice) filter.requiresInvoice = req.query.requiresInvoice === 'true';
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter).sort({ createdAt: 1 });

    // Aplanar órdenes — una fila por producto
    const rows = [];

    for (const order of orders) {
      for (const item of order.items) {
        rows.push({
          '# Orden':        order.orderNumber,
          'Fecha':          new Date(order.createdAt).toLocaleDateString('es-MX'),
          'Stand':          order.stand,
          'Cliente':        order.customer.name,
          'Correo':         order.customer.email || '',
          'Pago':           order.paymentType,
          'Factura':        order.requiresInvoice ? 'Sí' : 'No',
          'Fecha Entrega':  new Date(order.deliveryDate).toLocaleDateString('es-MX'),
          'Producto':       item.name,
          'Código':         item.barcode,
          'Cantidad':       item.quantity,
          'Precio Unit.':   item.appliedPrice,
          'Subtotal':       item.subtotal,
          'Total Orden':    order.total
        });
      }
    }

    // Reporte por proveedor — una fila por stand
    const standTotals = {};
    for (const order of orders) {
      if (!standTotals[order.stand]) {
        standTotals[order.stand] = { ordenes: 0, total: 0 };
      }
      standTotals[order.stand].ordenes++;
      standTotals[order.stand].total += order.total;
    }

    const standRows = Object.entries(standTotals).map(([stand, data]) => ({
      'Stand':           stand,
      'Total Órdenes':   data.ordenes,
      'Total Ventas':    data.total
    }));

    // Crear workbook con dos hojas
    const wb = XLSX.utils.book_new();

    const wsOrdenes = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, wsOrdenes, 'Órdenes');

    const wsStands = XLSX.utils.json_to_sheet(standRows);
    XLSX.utils.book_append_sheet(wb, wsStands, 'Por Stand');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=ordenes_feria.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;