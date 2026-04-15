const dotenv = require('dotenv');
const connectDB = require('./db');
const Order = require('../models/Order');

dotenv.config();

const seed = async () => {
  await connectDB();
  await Order.deleteMany();

  const orders = [
    // Papelería San Juan (C001) - contado - Stand Pelikan
    {
      orderNumber: 'ORD-001',
      stand: 'Stand 1 - Pelikan',
      vendorUser: '69d9119ee99ebf89865fa297',
      customer: {
        _id: '69d9119fe99ebf89865fa2a2',
        name: 'Papelería San Juan',
        email: 'compras@sanjuan.com',
        customerCode: 'C001',
        paymentType: 'contado',
        deliveryDate: new Date('2026-05-20'),
        requiresInvoice: true
      },
      items: [
        { product: '69d916e01495cd43ed27c818', barcode: '01.353', name: 'LAPIZ ENTRENADOR REDONDO DIXON TICONDEROGA JUMBO MY FIRST 36493', priceContado: 9.22, priceCredito: 9.59, appliedPrice: 9.22, quantity: 10, subtotal: 92.20 },
        { product: '69d916e01495cd43ed27ca90', barcode: '10.86', name: 'LAPIZ ADHESIVO PELIFIX 40 GRS PELIKAN', priceContado: 20.43, priceCredito: 21.27, appliedPrice: 20.43, quantity: 5, subtotal: 102.15 },
        { product: '69d916e01495cd43ed27c869', barcode: '03.07', name: 'GOMA TIPO LAPIZ BORRAPEN BACO', priceContado: 7.48, priceCredito: 8.05, appliedPrice: 7.48, quantity: 20, subtotal: 149.60 }
      ],
      total: 343.95,
      status: 'confirmed'
    },
    // Papelería San Juan (C001) - Stand Dixon
    {
      orderNumber: 'ORD-002',
      stand: 'Stand 2 - Dixon',
      vendorUser: '69d9119ee99ebf89865fa298',
      customer: {
        _id: '69d9119fe99ebf89865fa2a2',
        name: 'Papelería San Juan',
        email: 'compras@sanjuan.com',
        customerCode: 'C001',
        paymentType: 'contado',
        deliveryDate: new Date('2026-05-20'),
        requiresInvoice: true
      },
      items: [
        { product: '69d916e01495cd43ed27ca53', barcode: '10.042', name: 'Lapiz Bicolor de Madera Hexagonal. PELIKAN', priceContado: 4.25, priceCredito: 4.62, appliedPrice: 4.25, quantity: 50, subtotal: 212.50 },
        { product: '69d916e01495cd43ed27c91b', barcode: '06.K107', name: 'LAPIZ CHEQUEO ROJO TRIANGULAR KORES', priceContado: 3.34, priceCredito: 3.61, appliedPrice: 3.34, quantity: 30, subtotal: 100.20 }
      ],
      total: 312.70,
      status: 'confirmed'
    },
    // Roberto Hernández (C002) - crédito - Stand Scribe
    {
      orderNumber: 'ORD-003',
      stand: 'Stand 3 - Scribe',
      vendorUser: '69d9119ee99ebf89865fa299',
      customer: {
        _id: '69d9119fe99ebf89865fa2a3',
        name: 'Roberto Hernández',
        email: 'roberto.hdz@gmail.com',
        customerCode: 'C002',
        paymentType: 'credito',
        deliveryDate: new Date('2026-05-25'),
        requiresInvoice: false
      },
      items: [
        { product: '69d916e01495cd43ed27ca91', barcode: '10.881', name: 'LAPIZ ENTRENADOR TRIANGULAR JUMBO # 2 HB PELIKAN', priceContado: 11.36, priceCredito: 11.83, appliedPrice: 11.83, quantity: 12, subtotal: 141.96 },
        { product: '69d916e01495cd43ed27ca8f', barcode: '10.84', name: 'LAPIZ ADHESIVO PELIFIX 20 GRS PELIKAN', priceContado: 11.38, priceCredito: 11.86, appliedPrice: 11.86, quantity: 8, subtotal: 94.88 }
      ],
      total: 236.84,
      status: 'confirmed'
    },
    // Escuela Primaria Benito Juárez (C003) - contado - Stand Pelikan
    {
      orderNumber: 'ORD-004',
      stand: 'Stand 1 - Pelikan',
      vendorUser: '69d9119ee99ebf89865fa297',
      customer: {
        _id: '69d9119fe99ebf89865fa2a4',
        name: 'Escuela Primaria Benito Juárez',
        email: 'administracion@bjtareas.edu.mx',
        customerCode: 'C003',
        paymentType: 'contado',
        deliveryDate: new Date('2026-05-18'),
        requiresInvoice: true
      },
      items: [
        { product: '69d916e01495cd43ed27c818', barcode: '01.353', name: 'LAPIZ ENTRENADOR REDONDO DIXON TICONDEROGA JUMBO MY FIRST 36493', priceContado: 9.22, priceCredito: 9.59, appliedPrice: 9.22, quantity: 100, subtotal: 922.00 },
        { product: '69d916e01495cd43ed27c869', barcode: '03.07', name: 'GOMA TIPO LAPIZ BORRAPEN BACO', priceContado: 7.48, priceCredito: 8.05, appliedPrice: 7.48, quantity: 50, subtotal: 374.00 },
        { product: '69d916e01495cd43ed27ca92', barcode: '10.8812', name: 'LAPIZ 2HB TRIANGULAR JUMBO CON DISEÑO PELIKAN', priceContado: 10.86, priceCredito: 11.80, appliedPrice: 10.86, quantity: 30, subtotal: 325.80 }
      ],
      total: 1621.80,
      status: 'confirmed'
    },
    // Escuela Primaria Benito Juárez (C003) - Stand Pilot
    {
      orderNumber: 'ORD-005',
      stand: 'Stand 4 - Pilot',
      vendorUser: '69d9119ee99ebf89865fa29a',
      customer: {
        _id: '69d9119fe99ebf89865fa2a4',
        name: 'Escuela Primaria Benito Juárez',
        email: 'administracion@bjtareas.edu.mx',
        customerCode: 'C003',
        paymentType: 'contado',
        deliveryDate: new Date('2026-05-18'),
        requiresInvoice: true
      },
      items: [
        { product: '69d916e01495cd43ed27ca53', barcode: '10.042', name: 'Lapiz Bicolor de Madera Hexagonal. PELIKAN', priceContado: 4.25, priceCredito: 4.62, appliedPrice: 4.25, quantity: 80, subtotal: 340.00 },
        { product: '69d916e01495cd43ed27c91b', barcode: '06.K107', name: 'LAPIZ CHEQUEO ROJO TRIANGULAR KORES', priceContado: 3.34, priceCredito: 3.61, appliedPrice: 3.34, quantity: 60, subtotal: 200.40 }
      ],
      total: 540.40,
      status: 'confirmed'
    },
    // María Guadalupe Torres (C004) - contado - Stand Mead
    {
      orderNumber: 'ORD-006',
      stand: 'Stand 5 - Mead',
      vendorUser: '69d9119ee99ebf89865fa29b',
      customer: {
        _id: '69d9119fe99ebf89865fa2a5',
        name: 'María Guadalupe Torres',
        email: 'lupe.torres@hotmail.com',
        customerCode: 'C004',
        paymentType: 'contado',
        deliveryDate: new Date('2026-05-22'),
        requiresInvoice: false
      },
      items: [
        { product: '69d916e01495cd43ed27ca8f', barcode: '10.84', name: 'LAPIZ ADHESIVO PELIFIX 20 GRS PELIKAN', priceContado: 11.38, priceCredito: 11.86, appliedPrice: 11.38, quantity: 6, subtotal: 68.28 },
        { product: '69d916e01495cd43ed27c92b', barcode: '07.051', name: 'Lapiz Bicolor de Madera Hexagonal. MOLIN', priceContado: 2.09, priceCredito: 3.25, appliedPrice: 2.09, quantity: 24, subtotal: 50.16 }
      ],
      total: 118.44,
      status: 'confirmed'
    },
    // Distribuidora Norte (C005) - crédito - Stand Dixon
    {
      orderNumber: 'ORD-007',
      stand: 'Stand 2 - Dixon',
      vendorUser: '69d9119ee99ebf89865fa298',
      customer: {
        _id: '69d9119fe99ebf89865fa2a6',
        name: 'Distribuidora Norte',
        email: 'pedidos@distnorte.com',
        customerCode: 'C005',
        paymentType: 'credito',
        deliveryDate: new Date('2026-05-28'),
        requiresInvoice: true
      },
      items: [
        { product: '69d916e01495cd43ed27ca91', barcode: '10.881', name: 'LAPIZ ENTRENADOR TRIANGULAR JUMBO # 2 HB PELIKAN', priceContado: 11.36, priceCredito: 11.83, appliedPrice: 11.83, quantity: 25, subtotal: 295.75 },
        { product: '69d916e01495cd43ed27ca90', barcode: '10.86', name: 'LAPIZ ADHESIVO PELIFIX 40 GRS PELIKAN', priceContado: 20.43, priceCredito: 21.27, appliedPrice: 21.27, quantity: 15, subtotal: 319.05 },
        { product: '69d916e01495cd43ed27c818', barcode: '01.353', name: 'LAPIZ ENTRENADOR REDONDO DIXON TICONDEROGA JUMBO MY FIRST 36493', priceContado: 9.22, priceCredito: 9.59, appliedPrice: 9.59, quantity: 40, subtotal: 383.60 }
      ],
      total: 998.40,
      status: 'confirmed'
    },
    // Distribuidora Norte (C005) - Stand Scribe
    {
      orderNumber: 'ORD-008',
      stand: 'Stand 3 - Scribe',
      vendorUser: '69d9119ee99ebf89865fa299',
      customer: {
        _id: '69d9119fe99ebf89865fa2a6',
        name: 'Distribuidora Norte',
        email: 'pedidos@distnorte.com',
        customerCode: 'C005',
        paymentType: 'credito',
        deliveryDate: new Date('2026-05-28'),
        requiresInvoice: true
      },
      items: [
        { product: '69d916e01495cd43ed27c92b', barcode: '07.051', name: 'Lapiz Bicolor de Madera Hexagonal. MOLIN', priceContado: 2.09, priceCredito: 3.25, appliedPrice: 3.25, quantity: 100, subtotal: 325.00 },
        { product: '69d916e01495cd43ed27c869', barcode: '03.07', name: 'GOMA TIPO LAPIZ BORRAPEN BACO', priceContado: 7.48, priceCredito: 8.05, appliedPrice: 8.05, quantity: 35, subtotal: 281.75 }
      ],
      total: 606.75,
      status: 'confirmed'
    }
  ];

  await Order.insertMany(orders);
  console.log('8 órdenes de prueba creadas correctamente');
  process.exit();
};

seed();