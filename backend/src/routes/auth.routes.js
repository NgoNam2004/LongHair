const express = require('express');
const { generateToken } = require('../config/jwt');
const User = require('../models/User');
const { successResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { body } = require('express-validator');
const validate = require('../middlewares/validate.middleware');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Register Route (For testing purposes)
router.post('/register', validate([
  body('username').notEmpty(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('email').isEmail(),
]), asyncHandler(async (req, res) => {
  const { username, password, name, email, phone } = req.body;
  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const isFirstUser = (await User.countDocuments()) === 0;
  const user = await User.create({
    username, password, name, email, phone,
    role: isFirstUser ? 'admin' : 'staff',
  });
  const token = generateToken(user._id, user.role);

  return successResponse(res, 201, 'User created successfully', {
    token,
    user: { id: user._id, username: user.username, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
}));

// Mock Login Route
router.post('/login', validate([
  body('username').notEmpty(),
  body('password').notEmpty()
]), asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = await User.findOne({ username });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = generateToken(user._id, user.role);
  return successResponse(res, 200, 'Login successful', { token, user: { id: user._id, username: user.username, role: user.role } });
}));

router.get('/me', protect, asyncHandler(async (req, res) => {
    return successResponse(res, 200, 'User retrieved successfully', req.user);
}));

module.exports = router;
