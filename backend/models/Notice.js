const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a notice title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add notice content']
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notice', NoticeSchema);
