const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getStudentBorrowHistory,
  getActiveBorrows
} = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Student history can be fetched by student themselves or admin/librarian
router.get('/student/:studentId', getStudentBorrowHistory);

// Librarian/Admin only operations
router.post('/issue', authorize('librarian', 'admin'), issueBook);
router.post('/return', authorize('librarian', 'admin'), returnBook);
router.get('/active', authorize('librarian', 'admin'), getActiveBorrows);

module.exports = router;
