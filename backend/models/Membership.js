const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['Free', 'Premium', 'Enterprise'],
    default: 'Free'
  },
  membershipType: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
    default: 'Monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Expired', 'Suspended'],
    default: 'Active'
  },
  paymentId: {
    type: String,
    default: null
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
  }
});

module.exports = mongoose.model('Membership', MembershipSchema);
