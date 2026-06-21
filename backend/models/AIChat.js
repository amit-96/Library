const mongoose = require('mongoose');

const AIChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contextDocId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PDFDocument',
    default: null
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AIChat', AIChatSchema);
