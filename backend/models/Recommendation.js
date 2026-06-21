const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  recommendedBooks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);
