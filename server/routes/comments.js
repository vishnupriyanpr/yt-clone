const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { authMiddleware } = require('../middleware/authMiddleware');

// GET /api/comments/:videoId — paginated comments (top-level only)
router.get('/:videoId', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort === 'top' ? { likes: -1 } : { createdAt: -1 };

    const filter = { video: req.params.videoId, parentComment: null };

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate('author', 'username avatar')
        .populate({
          path: 'replies',
          populate: { path: 'author', select: 'username avatar' },
          options: { sort: { createdAt: 1 } },
        })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        comments,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/comments/:videoId — add comment (auth required)
router.post('/:videoId', authMiddleware, async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required.',
      });
    }

    const comment = new Comment({
      text: text.trim(),
      author: req.user.id,
      video: req.params.videoId,
    });

    await comment.save();
    await comment.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment posted.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/comments/:id/reply — reply to comment (auth required)
router.post('/:id/reply', authMiddleware, async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required.',
      });
    }

    const parentComment = await Comment.findById(req.params.id);
    if (!parentComment) {
      return res.status(404).json({ success: false, message: 'Parent comment not found.' });
    }

    const reply = new Comment({
      text: text.trim(),
      author: req.user.id,
      video: parentComment.video,
      parentComment: parentComment._id,
    });

    await reply.save();

    // Add to parent replies array
    parentComment.replies.push(reply._id);
    await parentComment.save();

    await reply.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      data: reply,
      message: 'Reply posted.',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/comments/:id/like — toggle like
router.put('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    const userId = req.user.id;
    const idx = comment.likes.indexOf(userId);
    const liked = idx === -1;

    if (liked) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(idx, 1);
    }

    await comment.save();

    res.json({
      success: true,
      data: { liked, likeCount: comment.likes.length },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/comments/:id — delete comment (author only)
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // If parent comment, also delete all replies
    if (comment.replies && comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    // If this is a reply, remove from parent's replies array
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Comment deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
