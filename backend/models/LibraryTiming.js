const mongoose = require('mongoose');

const LibraryTimingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shiftName: {
    type: String,
    enum: ['Morning Shift', 'Afternoon Shift', 'Evening Shift', 'Custom Timing'],
    default: 'Morning Shift'
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LibraryTiming', LibraryTimingSchema);
