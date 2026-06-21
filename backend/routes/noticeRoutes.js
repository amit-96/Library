const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  deleteNotice,
  getNotifications,
  markNotificationsAsRead
} = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Notice feed
router.get('/', getNotices);
router.post('/', authorize('librarian', 'admin'), createNotice);
router.delete('/:id', authorize('librarian', 'admin'), deleteNotice);

// Notifications feed
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsAsRead);

module.exports = router;
