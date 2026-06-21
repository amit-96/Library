const mongoose = require('mongoose');

const FaceProfileSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  faceEncoding: {
    type: [Number],
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FaceProfile', FaceProfileSchema);
