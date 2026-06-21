const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);

module.exports = router;

