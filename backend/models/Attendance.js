const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true
  },
  checkIn: {
    type: Date,
    default: Date.now
  },
  checkOut: {
    type: Date,
    default: null
  },
  method: {
    type: String,
    enum: ['QR', 'Face'],
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Present'
  }
});

// Virtual aliases for compatibility with the check-in controller
AttendanceSchema.virtual('checkInTime').get(function() {
  return this.checkIn;
}).set(function(val) {
  this.checkIn = val;
});

AttendanceSchema.virtual('checkOutTime').get(function() {
  return this.checkOut;
}).set(function(val) {
  this.checkOut = val;
});

// Compound index to prevent duplicate attendance logs per student per day
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

AttendanceSchema.set('toJSON', { virtuals: true });
AttendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
