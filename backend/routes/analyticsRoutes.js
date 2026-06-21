const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getStudentAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', authorize('librarian', 'admin'), getDashboardAnalytics);
router.get('/student/:studentId', getStudentAnalytics);

module.exports = router;
