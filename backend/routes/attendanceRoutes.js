const express = require('express');
const router = express.Router();
const {
  qrCheckin,
  faceCheckin,
  getReports,
  getStudentAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/qr-checkin', protect, qrCheckin);
router.get('/student/:studentId', protect, getStudentAttendance);

// Face check-in webhook and reports are restricted
router.post('/face-checkin', faceCheckin); // Webhook can be public or secured internally
router.get('/reports', protect, authorize('librarian', 'admin'), getReports);

module.exports = router;
