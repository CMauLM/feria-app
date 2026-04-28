const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      stand: user.stand,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/users — listar usuarios (solo admin)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/register (solo admin puede crear usuarios)
router.post('/register', protect, adminOnly, async (req, res) => {
  console.log('Body recibido en register:', req.body);
  try {
    const { name, email, password, role, stand, productPrefixes } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const user = await User.create({ name, email, password, role, stand, productPrefixes });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      stand: user.stand
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// PUT /api/auth/users/:id (solo admin)
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, role, stand, productPrefixes, password } = req.body;
    const update = { name, email, role, stand, productPrefixes };

    if (password) {
      const bcrypt = require('bcryptjs');
      update.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/auth/users/:id (solo admin)
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;