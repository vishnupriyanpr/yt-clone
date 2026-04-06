const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    default: '',
    maxlength: 5000,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  publicId: {
    type: String,
    required: [true, 'Public ID is required'],
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 0,
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  category: {
    type: String,
    enum: ['General', 'Music', 'Gaming', 'Tech', 'Vlog', 'Education', 'Entertainment'],
    default: 'General',
  },
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

videoSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

videoSchema.virtual('dislikeCount').get(function () {
  return this.dislikes ? this.dislikes.length : 0;
});

videoSchema.set('toJSON', { virtuals: true });
videoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Video', videoSchema);
