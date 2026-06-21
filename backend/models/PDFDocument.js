const mongoose = require('mongoose');

const PDFDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  vectorIndexKey: {
    type: String, // Used to associate the document with its vector storage index
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PDFDocument', PDFDocumentSchema);
