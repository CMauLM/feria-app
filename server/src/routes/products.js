const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Configurar multer — archivo en memoria, no en disco
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/products/import — importar Excel (solo admin)
router.post('/import', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Leer como array de arrays para manejar formato especial
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    // Los datos reales empiezan en fila 6 (índice 5)
    const dataRows = rows.slice(5).filter(row => row[2]); // filtrar filas con nombre

    const products = dataRows.map(row => ({
      sku: String(row[0] || '').trim(),
      barcode: String(row[0] || '').trim(), // usar SKU como barcode
      name: String(row[2] || '').trim(),
      unit: String(row[6] || 'pieza').trim(),
      priceContado: parseFloat(row[13]) || 0,
      priceCredito: parseFloat(row[10]) || 0,
      supplier: 'Distribuidora Papelera México'
    })).filter(p => p.name && p.sku);

    const bulkOps = products.map(product => ({
      updateOne: {
        filter: { barcode: product.barcode },
        update: { $set: product },
        upsert: true
      }
    }));

    const result = await Product.bulkWrite(bulkOps);

    const inserted = result.upsertedCount;
    const updated = result.modifiedCount;

    res.json({
      message: 'Importación completada',
      inserted,
      updated,
      total: products.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/search?q=termino — buscar por nombre o barcode
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Parámetro de búsqueda requerido' });
    }

    const filter = {
      $or: [
        { barcode: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } }
      ]
    };

    // Si es vendor con prefijos asignados, filtrar
    if (req.user.role === 'vendor' && req.user.productPrefixes?.length > 0) {
      const prefixRegex = req.user.productPrefixes.map(p => `^${p}\\.`).join('|');
      filter.barcode = { $regex: prefixRegex };
    }

    const products = await Product.find(filter).limit(10);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products — listar todos (con paginación básica)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};

    // Si es vendor con prefijos asignados, filtrar
    if (req.user.role === 'vendor' && req.user.productPrefixes?.length > 0) {
      const prefixRegex = req.user.productPrefixes.map(p => `^${p}\\.`).join('|');
      filter.barcode = { $regex: prefixRegex };
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Product.countDocuments(filter);

    res.json({ products, total, page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/products/all — borrar todo el catálogo (solo admin)
router.delete('/all', protect, adminOnly, async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.json({ message: 'Catálogo vaciado', deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;