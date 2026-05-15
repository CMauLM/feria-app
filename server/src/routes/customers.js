const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const Customer = require('../models/Customer');
const { protect, adminOnly } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/customers — registrar cliente nuevo
router.post('/', protect, async (req, res) => {
  try {
    const { name, email, phone, company, rfc, paymentType, deliveryDate, requiresInvoice, personType } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    if (!deliveryDate) {
      return res.status(400).json({ message: 'La fecha de entrega es requerida' });
    }

    // Buscar el código más alto existente
    const lastCustomer = await Customer.findOne({ customerCode: /^C\d+$/ })
      .sort({ customerCode: -1 })
      .limit(1);
    
    let nextNumber = 1;
    if (lastCustomer && lastCustomer.customerCode) {
      const num = parseInt(lastCustomer.customerCode.substring(1));
      if (!isNaN(num)) nextNumber = num + 1;
    }

    const customerCode = `C${String(nextNumber).padStart(3, '0')}`;

    const customer = await Customer.create({
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      rfc: rfc || null,
      personType: personType || 'fisica',
      requiresInvoice: requiresInvoice || false,
      paymentType: paymentType || 'contado',
      deliveryDate: new Date(deliveryDate),
      customerCode
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET /api/customers — listar clientes con búsqueda opcional
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { email: { $regex: req.query.q, $options: 'i' } },
        { company: { $regex: req.query.q, $options: 'i' } },
        { customerCode: { $regex: req.query.q, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter).sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/customers/:id — detalle de cliente
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/customers/:id — actualizar cliente (solo admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/customers/import — importar Excel (solo admin)
router.post('/import', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'El archivo está vacío' });
    }

    // Mapeo de columnas — ajustar cuando llegue el Excel real
    const customers = rows.map(row => ({
      name: String(row['Nombre'] || row['name'] || ''),
      email: String(row['Email'] || row['Correo'] || ''),
      phone: String(row['Telefono'] || row['Teléfono'] || ''),
      company: String(row['Empresa'] || row['Company'] || ''),
      rfc: String(row['RFC'] || ''),
      requiresInvoice: false
    })).filter(c => c.name);

    let inserted = 0;
    let updated = 0;

    for (const customer of customers) {
      const exists = await Customer.findOne({ email: customer.email });
      if (exists) {
        await Customer.updateOne({ email: customer.email }, customer);
        updated++;
      } else {
        await Customer.create(customer);
        inserted++;
      }
    }

    res.json({
      message: 'Importación completada',
      inserted,
      updated,
      total: customers.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/customers/:id — eliminar cliente (solo admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;