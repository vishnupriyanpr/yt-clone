const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Check existing
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.email === email ? 'Email already registered.' : 'Username already taken.',
      });
    }

    // Generate avatar
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7DC6F', '6C5CE7', 'FD79A8'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${color}&color=fff&size=128&bold=true`;

    const user = new User({ username, email, password, avatar });
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          channelName: user.channelName,
          subscriberCount: user.subscriberCount,
        },
      },
      message: 'Account created successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          channelName: user.channelName,
          subscriberCount: user.subscriberCount,
        },
      },
      message: 'Logged in successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me — current user profile
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('subscribers', 'username avatar')
      .populate('watchHistory', 'title thumbnailUrl');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        channelName: user.channelName,
        description: user.description,
        subscriberCount: user.subscriberCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile — update profile
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { channelName, description, avatar } = req.body;
    const updates = {};
    if (channelName !== undefined) updates.channelName = channelName;
    if (description !== undefined) updates.description = description;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        channelName: user.channelName,
        description: user.description,
        subscriberCount: user.subscriberCount,
      },
      message: 'Profile updated.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/subscribe/:userId — toggle subscribe
router.post('/subscribe/:userId', authMiddleware, async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot subscribe to yourself.' });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Channel not found.' });
    }

    const idx = target.subscribers.indexOf(req.user.id);
    const subscribed = idx === -1;

    if (subscribed) {
      target.subscribers.push(req.user.id);
    } else {
      target.subscribers.splice(idx, 1);
    }

    await target.save();

    res.json({
      success: true,
      data: {
        subscribed,
        subscriberCount: target.subscribers.length,
      },
      message: subscribed ? 'Subscribed!' : 'Unsubscribed.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/user/:id — public user profile
router.get('/user/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        channelName: user.channelName,
        description: user.description,
        subscribers: user.subscribers || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
