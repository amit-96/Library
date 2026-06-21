const mongoose = require('mongoose');

const FeeRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  admissionFee: {
    type: Number,
    default: 0
  },
  monthlyFee: {
    type: Number,
    default: 0
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Card', 'Net Banking'],
    default: 'Cash'
  },
  transactionId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Overdue'],
    default: 'Unpaid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of fee record for a student per month/year
FeeRecordSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('FeeRecord', FeeRecordSchema);
