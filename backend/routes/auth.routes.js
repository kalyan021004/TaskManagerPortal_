import express from 'express';
import User from '../models/user.models.js';
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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
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
      message: 'Login failed',
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

export default router;
