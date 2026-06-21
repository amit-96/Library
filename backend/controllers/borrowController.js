const BorrowHistory = require('../models/BorrowHistory');
const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Issue a book to a student
// @route   POST /api/borrow/issue
// @access  Private/Librarian/Admin
exports.issueBook = async (req, res, next) => {
  try {
    const { studentEmail, bookIsbn, durationDays = 14 } = req.body;

    // Find student
    const student = await User.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found with this email' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Books can only be issued to students' });
    }

    // Find book
    const book = await Book.findOne({ isbn: bookIsbn });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found with this ISBN' });
    }

    // Check availability
    if (book.availableQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Book is currently out of stock' });
    }

    // Check if student has reached the borrowing limit (max 3 books)
    const activeBorrowCount = await BorrowHistory.countDocuments({
      userId: student._id,
      status: 'Issued'
    });

    if (activeBorrowCount >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Student has reached the maximum borrowing limit of 3 books'
      });
    }

    // Check if student already has this book issued and not returned
    const alreadyIssued = await BorrowHistory.findOne({
      userId: student._id,
      bookId: book._id,
      status: 'Issued'
    });

    if (alreadyIssued) {
      return res.status(400).json({ success: false, message: 'This book is already issued to the student' });
    }

    // Issue book
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(durationDays));

    const borrow = await BorrowHistory.create({
      bookId: book._id,
      userId: student._id,
      dueDate
    });

    // Update book inventory
    book.availableQuantity -= 1;
    await book.save();

    // Send WhatsApp Alert
    const { sendWhatsAppAlert } = require('../utils/whatsappService');
    const phone = student.phone || '+919999999999';
    const formattedDue = dueDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    sendWhatsAppAlert(phone, `📚 *Book Issued Successfully*\n\n*Book*: ${book.title}\n*Due Date*: ${formattedDue}\n\nPlease return the book on time to avoid library fines!`);

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: borrow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return an issued book
// @route   POST /api/borrow/return
// @access  Private/Librarian/Admin
exports.returnBook = async (req, res, next) => {
  try {
    const { borrowId } = req.body;

    const borrow = await BorrowHistory.findById(borrowId).populate('bookId').populate('userId');
    if (!borrow) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    if (borrow.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Book has already been returned' });
    }

    // Calculate fine (e.g. 10 rupees/units per day overdue)
    const today = new Date();
    let fineAmount = 0;
    if (today > borrow.dueDate) {
      const diffTime = Math.abs(today - borrow.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 10;
    }

    // Update borrow history
    borrow.returnDate = today;
    borrow.fineAmount = fineAmount;
    borrow.status = 'Returned';
    await borrow.save();

    // Increment book availability
    const book = await Book.findById(borrow.bookId);
    if (book) {
      book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
      await book.save();
    }

    // Send WhatsApp Alert
    const { sendWhatsAppAlert } = require('../utils/whatsappService');
    const phone = borrow.userId?.phone || '+919999999999';
    let fineText = fineAmount > 0 ? `\n*Overdue Fine*: ₹${fineAmount}` : '';
    sendWhatsAppAlert(phone, `✅ *Book Returned Successfully*\n\n*Book*: ${borrow.bookId.title}${fineText}\n\nThank you for returning it to the library!`);

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: {
        borrow,
        fineAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get borrowing history of a student or self
// @route   GET /api/borrow/student/:studentId
// @access  Private
exports.getStudentBorrowHistory = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Security check: Students can only view their own history
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own borrow history' });
    }

    const history = await BorrowHistory.find({ userId: studentId })
      .populate('bookId')
      .populate('userId', 'name email studentId')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active borrowings
// @route   GET /api/borrow/active
// @access  Private/Librarian/Admin
exports.getActiveBorrows = async (req, res, next) => {
  try {
    const borrows = await BorrowHistory.find({ status: 'Issued' })
      .populate('bookId')
      .populate('userId', 'name email studentId')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: borrows.length,
      data: borrows
    });
  } catch (error) {
    next(error);
  }
};
