const mongoose = require('mongoose');

const StudyRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved'],
    default: 'Available'
  }
});

module.exports = mongoose.model('StudyRoom', StudyRoomSchema);
