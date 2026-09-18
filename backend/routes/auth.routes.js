import express from 'express';
import User from '../models/user.models.js';
import admin from '../config/firebase.js';
import { authenticate } from '../middleware/auth.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();

/* ===========================
   REGISTER
=========================== */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
});

/* ===========================
   LOGIN
=========================== */
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Firebase token required',
      });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    const {
      email,
      name,
      picture,
      uid
    } = decoded;

    console.log('Google user:', {
      uid,
      email,
      name,
      picture
    });

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not available',
      });
    }

    // Find existing user
    let user = await User.findOne({ email });

    if (!user) {

      // Create new user
      user = await User.create({
        username: name || email.split('@')[0],
        email: email,
        password: Math.random().toString(36),
        avatar: picture || '',
        firebaseUid: uid
      });

      console.log('✅ New Google user created');
    } 
    
    else {

      // Update Google user's information
      user.username = name || user.username;
      user.avatar = picture || user.avatar;
      user.firebaseUid = uid;

      await user.save();

      console.log('✅ Existing user updated');
    }

    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',

      token: jwtToken,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (err) {

    console.error('Google authentication error:', err);

    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});
/* ===========================
   PROFILE
=========================== */
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

/* ===========================
   LOGOUT
=========================== */
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/* ===========================
   GOOGLE LOGIN
=========================== */
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Firebase token required',
      });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    const { email, name, picture } = decoded;

    // Find existing user
    let user = await User.findOne({ email });

    // Create new user if not exists
    if (!user) {
      user = await User.create({
        username: name,
        email,
        password: Math.random().toString(36), // dummy password
        avatar: picture,
      });
    }

    // Generate YOUR existing JWT
    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
    });
  }
});

export default router;
