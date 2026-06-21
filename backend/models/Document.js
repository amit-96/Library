const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  documentType: {
    type: String,
    enum: ['PDF', 'DOCX', 'PPT'],
    default: 'PDF'
  },
  totalPages: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
