/**
 * Authentication routes - sign in, sign up
 */

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';
import { findUserByEmail, saveUser } from '../storage/storage.js';

const router = Router();

/**
 * POST /auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = {
      id: `user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      password, // In production: hash with bcrypt
    };
    await saveUser(user);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Sign up failed' });
  }
});

/**
 * POST /auth/signin
 * Sign in with email and password (validates against hardcoded + stored users)
 */
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Sign in failed' });
  }
});

export default router;
