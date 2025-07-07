const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const User = require('../models/user');
const verifyToken = require('../middleware/auth.js');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const allowedDomain = process.env.ALLOWED_DOMAIN;
const domain = allowedDomain?.trim();

//google-auth route
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

    res.cookie("token", token, {
      httpOnly: true, // Set to true in production (HTTPS)
      secure: true, // 🔐 Must be true when sameSite is None
      sameSite: "None", // ✅ Allow sending cookie in cross-origin requests
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    const userObj = user.toObject();
    res.status(200).json({ user: userObj });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ message: 'Google authentication failed.' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password'); // Exclude password if exists
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;