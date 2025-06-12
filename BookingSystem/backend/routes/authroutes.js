const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const User = require('../models/user');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const allowedDomain = process.env.ALLOWED_DOMAIN;

// Register
router.post('/register', async (req, res) => {
  console.log('📥 Login route hit:', req.body);
  const { email, password, role } = req.body;
  if (!email.endsWith(`@${allowedDomain}`)) {
    return res.status(400).json({ message: `Signup allowed only for @${allowedDomain} emails` });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('📥 Login route hit:', req.body);
  const { email, password, role } = req.body;
  if (!email.endsWith(`@${allowedDomain}`)) {
    return res.status(403).json({ message: `Login allowed only for @${allowedDomain} emails` });
  }
  try {
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: 'User not found or role mismatch' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ message: 'Login successful', user, token });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});


router.post('/google-auth', async (req, res) => {
  console.log('📥 Login route hit:', req.body);
  const { tokenId, role } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        googleId,
        role: role || 'faculty',
        password: '', // empty password for Google users
        googleUser: true,
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ token, user });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ message: 'Google authentication failed.' });
  }
});

module.exports = router;