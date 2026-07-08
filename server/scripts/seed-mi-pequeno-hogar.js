// Carga el catálogo de productos y la lista de útiles de Centro Educativo Mi
// Pequeño Hogar (4to de primaria), a partir de la cotización real COT42559
// que compartió Mau como referencia.
// Se corre con: node scripts/seed-mi-pequeno-hogar.js
//
// Nota: el PDF original traía 20% de descuento en varios artículos. Aquí se
// usa el precio de lista (columna "Precio" antes del descuento) como
// priceContado, según lo acordado para las cotizaciones del bot.
// priceCredito no viene en el PDF, se deja igual a priceContado como
// placeholder (el bot solo cotiza a contado).

require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const School = require('../src/models/School');
const Product = require('../src/models/Product');
const SchoolList = require('../src/models/SchoolList');

const SCHOOL_NAME = 'Centro Educativo Mi Pequeño Hogar';

const PRODUCTS = [
  { barcode: '08.40', name: 'Lapicera c/plantilla LAP103ES Janel', priceContado: 34.48, supplier: 'Janel', unit: 'pieza', quantity: 1 },
  { barcode: '10.332', name: 'Colores largos Pinta Loco triangulares c/12 Pelikan', priceContado: 55.74, supplier: 'Pelikan', unit: 'pieza', quantity: 1 },
  { barcode: '10.88T', name: 'Lápiz triangular #2 Pelikan', priceContado: 4.31, supplier: 'Pelikan', unit: 'pieza', quantity: 1 },
  { barcode: '10.042', name: 'Lápiz bicolor de madera hexagonal Pelikan', priceContado: 8.62, supplier: 'Pelikan', unit: 'pieza', quantity: 1 },
  { barcode: '53.04', name: 'Diccionario básico escolar azul (3°/4°) Larousse', priceContado: 112.00, supplier: 'Larousse', unit: 'pieza', quantity: 1 },
  { barcode: '54.153', name: 'Sacapuntas con depósito 1 orificio Pascua', priceContado: 7.11, supplier: 'Pascua', unit: 'pieza', quantity: 1 },
  { barcode: '10.P177', name: 'Tijera escolar 5" Pelikan', priceContado: 16.04, supplier: 'Pelikan', unit: 'pieza', quantity: 1 },
  { barcode: '10.71', name: 'Goma de migajón M-20 Pelikan', priceContado: 6.89, supplier: 'Pelikan', unit: 'pieza', quantity: 1 },
  { barcode: '49.02', name: 'Lápiz adhesivo 22g Bully', priceContado: 16.56, supplier: 'Bully', unit: 'pieza', quantity: 2 },
  { barcode: '89.08', name: 'Sopa de letras ortografía/reafirmado', priceContado: 64.88, supplier: null, unit: 'pieza', quantity: 1 },
  { barcode: '11.G1526', name: 'Pincel plano S100 #6 Barrilito', priceContado: 16.98, supplier: 'Barrilito', unit: 'pieza', quantity: 1 },
  { barcode: '68.01', name: 'Papel semikraft por metro', priceContado: 17.24, supplier: null, unit: 'pieza', quantity: 6 },
  { barcode: '07.CONTAC', name: 'Papel contac por metro transparente', priceContado: 20.00, supplier: null, unit: 'metro', quantity: 3 },
  { barcode: '22.C108', name: 'Bolígrafo c/3 en blister negro, azul y rojo Pointe Pelikan', priceContado: 16.61, supplier: 'Pelikan', unit: 'pieza', quantity: 1 },
  { barcode: '80.07020', name: 'Pintura Politec 250g blanco #301', priceContado: 71.53, supplier: 'Rodin', unit: 'pieza', quantity: 2 },
  { barcode: '21.89', name: 'Globos #10 c/100 blanco Gloofi', priceContado: 75.86, supplier: 'Gloofi', unit: 'bolsa', quantity: 1 },
  { barcode: '54.31', name: 'Foamy toalla 4 carta diferentes colores 55x43 cm rojo', priceContado: 25.47, supplier: null, unit: 'pieza', quantity: 5 },
  { barcode: '37.88', name: 'Foamy carta c/diamantina blanco irisado Saira', priceContado: 5.18, supplier: 'Saira', unit: 'pieza', quantity: 5 },
  { barcode: '37.136', name: 'Foamy extendido c/diamantina verde bandera Saira', priceContado: 17.25, supplier: 'Saira', unit: 'pieza', quantity: 5 },
  { barcode: '37.149', name: 'Foamy 70x95 rojo en pliego Saira', priceContado: 21.56, supplier: 'Saira', unit: 'pliego', quantity: 5 },
  { barcode: '10.797', name: 'Juego geométrico flexible Pelikan', priceContado: 95.69, supplier: 'Pelikan', unit: 'pieza', quantity: 1 },
  { barcode: '08.341030', name: 'Curling metálico #1 100 mt rojo Janel', priceContado: 36.47, supplier: 'Janel', unit: 'rollo', quantity: 1 },
  { barcode: '10.94010', name: 'Marcador p/pizarrón blanco/verde Pelikan', priceContado: 18.10, supplier: 'Pelikan', unit: 'pieza', quantity: 4 },
  { barcode: '46.45060', name: 'Marcador permanente azul Escrimex/Jumbo', priceContado: 12.93, supplier: 'Escrimex', unit: 'pieza', quantity: 2 },
  { barcode: '02.2823', name: 'Hojas blancas tamaño carta paquete c/100 piezas', priceContado: 32.75, supplier: null, unit: 'paquete', quantity: 1 },
  { barcode: '50.428RA', name: 'Libreta profesional Uno raya Norma morado, rojo y amarillo', priceContado: 56.03, supplier: 'Norma', unit: 'pieza', quantity: 3 },
  { barcode: '50.428C7', name: 'Libreta profesional Uno cuadro 7 Norma azul', priceContado: 56.03, supplier: 'Norma', unit: 'pieza', quantity: 1 },
  { barcode: '50.428BL', name: 'Libreta profesional Uno blanco Norma naranja', priceContado: 56.03, supplier: 'Norma', unit: 'pieza', quantity: 1 },
  { barcode: '24.35040', name: 'Folder tamaño carta azul pastel Fortec', priceContado: 3.45, supplier: 'Fortec', unit: 'pieza', quantity: 5 },
  { barcode: '37.971', name: 'Corrector líquido 20 ml Saira', priceContado: 12.93, supplier: 'Saira', unit: 'pieza', quantity: 1 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Conectado a MongoDB');

    const nameNormalized = School.normalize(SCHOOL_NAME);
    let school = await School.findOne({ nameNormalized });
    if (!school) {
      school = await School.create({
        name: SCHOOL_NAME,
        nameNormalized,
        aliases: ['Mi Pequeño Hogar', 'Pequeño Hogar'],
        city: 'Pueblo Nuevo, Chiapas',
        isConvenio: true
      });
      console.log(`✅ Escuela creada: ${school.name}`);
    } else {
      console.log(`ℹ️  Escuela ya existía: ${school.name}`);
    }

    const items = [];
    for (const p of PRODUCTS) {
      const product = await Product.findOneAndUpdate(
        { barcode: p.barcode },
        {
          barcode: p.barcode,
          name: p.name,
          priceContado: p.priceContado,
          priceCredito: p.priceContado,
          supplier: p.supplier,
          unit: p.unit
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      items.push({ product: product._id, quantity: p.quantity, priceContado: p.priceContado });
    }
    console.log(`✅ ${items.length} productos cargados/actualizados`);

    const schoolList = await SchoolList.findOneAndUpdate(
      { school: school._id, level: 'primaria', grade: '4', sex: 'unisex' },
      { school: school._id, level: 'primaria', grade: '4', sex: 'unisex', items, isActive: true },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`✅ SchoolList creada/actualizada (id: ${schoolList._id})`);

    const total = items.reduce((sum, i) => sum + i.priceContado * i.quantity, 0);
    console.log(`\n🎉 Listo. Subtotal sin IVA: $${total.toFixed(2)}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
