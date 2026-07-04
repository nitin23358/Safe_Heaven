const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const userStore = require('../lib/userStore');
const { isDbConnected } = require('../lib/dbStatus');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

async function registerWithDb(name, email, password) {
  const [existingUser] = await db.promise().query(
    'SELECT * FROM User WHERE Email = ?',
    [email]
  );

  if (existingUser.length > 0) {
    const err = new Error('User already exists');
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.promise().query(
    'INSERT INTO User (Name, Email, Password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );

  return {
    id: result.insertId,
    name,
    email,
  };
}

async function loginWithDb(email, password) {
  const [users] = await db.promise().query(
    'SELECT * FROM User WHERE Email = ?',
    [email]
  );

  if (users.length === 0) {
    const err = new Error('Invalid credentials');
    err.status = 400;
    throw err;
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.Password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.status = 400;
    throw err;
  }

  return {
    id: user.UserID,
    name: user.Name,
    email: user.Email,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let user;
    if (isDbConnected()) {
      user = await registerWithDb(name, email, password);
    } else {
      user = await userStore.register(name, email, password);
    }

    const token = signToken(user.id);

    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      message: error.message || 'Server error',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user;
    if (isDbConnected()) {
      user = await loginWithDb(email, password);
    } else {
      user = await userStore.login(email, password);
    }

    const token = signToken(user.id);

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;
