const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
    unique: true
  },
  floor: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Occupied'],
    default: 'Available'
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reservationStart: {
    type: Date,
    default: null
  },
  reservationEnd: {
    type: Date,
    default: null
  }
});

// Virtual compatibility aliases for existing frontend displays
SeatSchema.virtual('occupiedBy').get(function() {
  return this.reservedBy;
}).set(function(val) {
  this.reservedBy = val;
});

SeatSchema.virtual('reservedUntil').get(function() {
  return this.reservationEnd;
}).set(function(val) {
  this.reservationEnd = val;
});

SeatSchema.set('toJSON', { virtuals: true });
SeatSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Seat', SeatSchema);
