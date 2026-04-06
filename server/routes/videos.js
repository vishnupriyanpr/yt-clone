const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const cloudinary = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    const filter = { visibility: 'public' };
    if (category && category !== 'All') {
      filter.category = category;
    }

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .populate('uploader', 'username avatar channelName subscribers')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Video.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/trending', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const videos = await Video.find({ visibility: 'public' })
      .populate('uploader', 'username avatar channelName')
      .sort({ views: -1 })
      .limit(limit);

    res.json({ success: true, data: { videos } });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'relevance';

    if (!q) {
      return res.json({ success: true, data: { videos: [], total: 0, totalPages: 0, currentPage: 1 } });
    }

    const regex = new RegExp(q, 'i');
    const filter = {
      visibility: 'public',
      $or: [
        { title: regex },
        { tags: regex },
        { description: regex },
      ],
    };

    if (category && category !== 'All') {
      filter.category = category;
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'views') sortObj = { views: -1 };
    if (sort === 'date') sortObj = { createdAt: -1 };

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .populate('uploader', 'username avatar channelName')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Video.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        videos,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/channel/:userId', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { uploader: req.params.userId, visibility: 'public' };

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .populate('uploader', 'username avatar channelName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Video.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('uploader', 'username avatar channelName subscribers description');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    res.json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, description, videoUrl, publicId, thumbnailUrl, tags, category, visibility, duration } = req.body;

    if (!title || !videoUrl || !publicId) {
      return res.status(400).json({
        success: false,
        message: 'Title, video URL, and public ID are required.',
      });
    }

    const video = new Video({
      title,
      description: description || '',
      videoUrl,
      publicId,
      thumbnailUrl: thumbnailUrl || '',
      uploader: req.user.id,
      tags: tags || [],
      category: category || 'General',
      visibility: visibility || 'public',
      duration: duration || 0,
    });

    await video.save();
    await video.populate('uploader', 'username avatar channelName');

    res.status(201).json({
      success: true,
      data: video,
      message: 'Video created successfully.',
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    const userId = req.user.id;
    const likeIdx = video.likes.indexOf(userId);
    const dislikeIdx = video.dislikes.indexOf(userId);

    if (dislikeIdx !== -1) {
      video.dislikes.splice(dislikeIdx, 1);
    }

    const liked = likeIdx === -1;
    if (liked) {
      video.likes.push(userId);
    } else {
      video.likes.splice(likeIdx, 1);
    }

    await video.save();

    res.json({
      success: true,
      data: {
        liked,
        likeCount: video.likes.length,
        dislikeCount: video.dislikes.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/dislike', authMiddleware, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    const userId = req.user.id;
    const dislikeIdx = video.dislikes.indexOf(userId);
    const likeIdx = video.likes.indexOf(userId);

    if (likeIdx !== -1) {
      video.likes.splice(likeIdx, 1);
    }

    const disliked = dislikeIdx === -1;
    if (disliked) {
      video.dislikes.push(userId);
    } else {
      video.dislikes.splice(dislikeIdx, 1);
    }

    await video.save();

    res.json({
      success: true,
      data: {
        disliked,
        likeCount: video.likes.length,
        dislikeCount: video.dislikes.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    if (video.uploader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this video.' });
    }

    if (video.publicId) {
      try {
        await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
      } catch (e) {
        // Cloudinary delete is best-effort
      }
    }

    await Comment.deleteMany({ video: req.params.id });
    await Video.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Video deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
