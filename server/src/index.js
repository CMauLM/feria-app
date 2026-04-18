const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const exportRoutes = require('./routes/export'); 

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/export', exportRoutes); 
app.use(cors({
  origin: ['http://localhost:5173', 'https://feria-app.netlify.app'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ message: 'Feria App API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});