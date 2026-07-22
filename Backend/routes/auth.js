const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  try {
    return res.json({ email: req.user.email, role: req.user.role });
  } catch (err) {
    console.error('GET /me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
