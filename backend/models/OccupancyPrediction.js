const mongoose = require('mongoose');

const OccupancyPredictionSchema = new mongoose.Schema({
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true
  },
  timeSlot: {
    type: String, // e.g. '16:00-18:00'
    required: true
  },
  predictedOccupancy: {
    type: Number, // Percentage: e.g. 92
    required: true
  },
  confidence: {
    type: Number, // Probability: e.g. 0.88
    default: 0.90
  }
});

// Compound unique key to avoid duplicate predictions per timeslot per day
OccupancyPredictionSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('OccupancyPrediction', OccupancyPredictionSchema);
