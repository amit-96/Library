const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  getCategories
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/:id', getBook);

// Protected routes (Librarians and Admins only)
router.post('/', protect, authorize('librarian', 'admin'), addBook);
router.put('/:id', protect, authorize('librarian', 'admin'), updateBook);
router.delete('/:id', protect, authorize('librarian', 'admin'), deleteBook);

module.exports = router;
