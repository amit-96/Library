const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category, author } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ title: 1 });

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a book
// @route   POST /api/books
// @access  Private/Librarian/Admin
exports.addBook = async (req, res, next) => {
  try {
    const { title, author, category, isbn, edition, quantity, shelfLocation, coverImage } = req.body;

    // Check if book with ISBN exists
    let book = await Book.findOne({ isbn });
    if (book) {
      return res.status(400).json({ success: false, message: 'Book with this ISBN already exists. Please update quantity instead.' });
    }

    book = await Book.create({
      title,
      author,
      category,
      isbn,
      edition,
      quantity,
      availableQuantity: quantity, // initially all are available
      shelfLocation,
      coverImage: coverImage || undefined
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Librarian/Admin
exports.updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Handle updating quantity & available quantity logic
    if (req.body.quantity !== undefined) {
      const diff = req.body.quantity - book.quantity;
      req.body.availableQuantity = Math.max(0, book.availableQuantity + diff);
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Librarian/Admin
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get book categories
// @route   GET /api/books/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Book.distinct('category');
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
