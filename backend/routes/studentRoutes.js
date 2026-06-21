const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  addStudent,
  listStudents,
  getStudentProfile,
  editStudent,
  deleteStudent,
  assignTiming,
  updateMembershipPlan,
  collectFees,
  getFeesDashboard,
  triggerFeeReminders,
  manualAttendanceEntry,
  getReports
} = require('../controllers/studentController');

// All routes require authentication
router.use(protect);

// Admin / Librarian only dashboard and bulk reminders
router.get('/dashboard/fees', authorize('admin', 'librarian'), getFeesDashboard);
router.post('/fees/reminders', authorize('admin', 'librarian'), triggerFeeReminders);
router.get('/reports/export', authorize('admin', 'librarian'), getReports);

// Student listing & creation
router.route('/')
  .get(authorize('admin', 'librarian'), listStudents)
  .post(authorize('admin', 'librarian'), addStudent);

// Student timings, memberships, fees, manual attendance
router.post('/:id/timing', authorize('admin', 'librarian'), assignTiming);
router.post('/:id/membership', authorize('admin', 'librarian'), updateMembershipPlan);
router.post('/:id/fees', authorize('admin', 'librarian'), collectFees);
router.post('/:id/attendance/manual', authorize('admin', 'librarian'), manualAttendanceEntry);

// Profile detail, updates, deletion
router.route('/:id')
  .get(getStudentProfile) // student can fetch own profile, handled inside controller
  .put(authorize('admin', 'librarian'), editStudent)
  .delete(authorize('admin'), deleteStudent);

module.exports = router;
