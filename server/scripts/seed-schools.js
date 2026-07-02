// Script para cargar escuelas de prueba en MongoDB.
// Se corre con: node scripts/seed-schools.js

require('dotenv').config();
const mongoose = require('mongoose');
const School = require('../src/models/School');

const TEST_SCHOOLS = [
  {
    name: 'Colegio Lincoln de Tuxtla',
    aliases: ['Lincoln', 'El Lincoln', 'Colegio Lincoln'],
    city: 'Tuxtla Gutiérrez',
    isConvenio: true
  },
  {
    name: 'Instituto Antara',
    aliases: ['Antara', 'El Antara'],
    city: 'Tuxtla Gutiérrez',
    isConvenio: true
  },
  {
    name: 'Colegio del Valle',
    aliases: ['Del Valle', 'CDV'],
    city: 'Tuxtla Gutiérrez',
    isConvenio: true
  },
  {
    name: 'Colegio Bilingüe Frida Kahlo',
    aliases: ['Frida Kahlo', 'Frida', 'Bilingüe Frida'],
    city: 'Tuxtla Gutiérrez',
    isConvenio: true
  },
  {
    name: 'Instituto Cumbres',
    aliases: ['Cumbres'],
    city: 'Tuxtla Gutiérrez',
    isConvenio: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Conectado a MongoDB');

    const deleted = await School.deleteMany({ registeredVia: 'manual' });
    console.log(`🗑️  Borradas ${deleted.deletedCount} escuelas previas`);

    for (const s of TEST_SCHOOLS) {
      s.nameNormalized = School.normalize(s.name);
      await School.create(s);
      console.log(`✅ ${s.name}`);
    }

    console.log(`\n🎉 Cargadas ${TEST_SCHOOLS.length} escuelas de prueba`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();