const dotenv = require('dotenv');
const connectDB = require('./db');
const User = require('../models/User');

dotenv.config();

const seed = async () => {
  await connectDB();

  const exists = await User.findOne({ email: 'admin@feria.com' });
  if (exists) {
    console.log('Admin ya existe');
    process.exit();
  }

  await User.create({
    name: 'Administrador',
    email: 'admin@feria.com',
    password: 'admin123',
    role: 'admin',
    stand: null
  });

  console.log('Admin creado correctamente');
  process.exit();
};

seed();