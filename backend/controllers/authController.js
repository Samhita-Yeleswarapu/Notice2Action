const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || password.length < 8) {
    const error = new Error('Email and a password of at least 8 characters are required.');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error('An account with that email already exists.');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({
    success: true,
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await user.comparePassword(password || ''))) {
    const error = new Error('Invalid email or password.');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  res.json({
    success: true,
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email },
  });
});

module.exports = { register, login };
