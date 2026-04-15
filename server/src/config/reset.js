const dotenv = require('dotenv');
const connectDB = require('./db');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

dotenv.config();

const reset = async () => {
  await connectDB();

  await Order.deleteMany();
  await Customer.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  console.log('Base de datos limpia');
  process.exit();
};

reset();