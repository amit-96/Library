const mongoose = require('mongoose');

const BorrowHistorySchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Overdue'],
    default: 'Issued'
  }
});

// Virtual aliases for backward compatibility with frontend pages and APIs
BorrowHistorySchema.virtual('studentId').get(function() {
  return this.userId;
}).set(function(val) {
  this.userId = val;
});

BorrowHistorySchema.virtual('fine').get(function() {
  return this.fineAmount;
}).set(function(val) {
  this.fineAmount = val;
});

BorrowHistorySchema.set('toJSON', { virtuals: true });
BorrowHistorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BorrowHistory', BorrowHistorySchema);
