const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'librarian', 'admin'],
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  faceRegistered: {
    type: Boolean,
    default: false
  },
  faceEmbeddings: {
    type: [Number],
    default: []
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  rollNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  course: {
    type: String,
    default: null
  },
  year: {
    type: String,
    default: null
  },
  semester: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  profilePhoto: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  membershipNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  membershipStatus: {
    type: String,
    enum: ['Active', 'Pending', 'Expired', 'Suspended'],
    default: 'Pending'
  },
  libraryShift: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Custom'],
    default: 'Morning'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET || 'supersecretlibraai_jsonwebtokenkey_123456', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
