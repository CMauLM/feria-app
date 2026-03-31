const dotenv = require('dotenv');
const connectDB = require('./db');
const Product = require('../models/Product');

dotenv.config();

const seed = async () => {
  await connectDB();

  await Product.deleteMany();

  await Product.insertMany([
    {
      barcode: '7501234567890',
      sku: 'PAP-001',
      name: 'Papel Bond Carta 500 hojas',
      priceContado: 85.00,
      priceCredito: 92.00,
      supplier: 'Proveedor A',
      unit: 'resma'
    },
    {
      barcode: '7509876543210',
      sku: 'FOL-001',
      name: 'Folder Manila Carta',
      priceContado: 45.00,
      priceCredito: 49.00,
      supplier: 'Proveedor B',
      unit: 'pieza'
    }
  ]);

  console.log('Productos de prueba creados');
  process.exit();
};

seed();