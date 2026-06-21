const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true,
    unique: true
  },
  totalLogins: {
    type: Number,
    default: 0
  },
  booksIssued: {
    type: Number,
    default: 0
  },
  activeSeatReservations: {
    type: Number,
    default: 0
  },
  attendanceCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
