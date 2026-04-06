const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/upload/sign — generate Cloudinary upload signature
// Client uploads directly to Cloudinary using unsigned preset.
// No file passes through the server (avoids Vercel 4.5MB body limit).
router.post('/sign', authMiddleware, (req, res, next) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      timestamp,
      folder: 'yt-clone',
    };
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
