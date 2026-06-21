const mongoose = require('mongoose');

const GamificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: {
    type: [String],
    default: []
  },
  streakDays: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gamification', GamificationSchema);
