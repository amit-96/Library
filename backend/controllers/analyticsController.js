const User = require('../models/User');
const Book = require('../models/Book');
const BorrowHistory = require('../models/BorrowHistory');
const Attendance = require('../models/Attendance');
const Seat = require('../models/Seat');
const mongoose = require('mongoose');

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get dashboard metrics for Admin/Librarian
// @route   GET /api/analytics/dashboard
// @access  Private/Librarian/Admin
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const todayStr = getLocalDateString();

    const [
      studentsCount,
      booksCount,
      issuedCount,
      attendanceTodayCount,
      totalSeats,
      occupiedSeats
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Book.countDocuments({}),
      BorrowHistory.countDocuments({ status: 'Issued' }),
      Attendance.countDocuments({ date: todayStr }),
      Seat.countDocuments({}),
      Seat.countDocuments({ status: { $ne: 'Available' } })
    ]);

    // Book categories analytics
    const categoriesStats = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: '$quantity' } } }
    ]);

    // Last 7 days attendance trend
    const attendanceStats = await Attendance.aggregate([
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    // Recent activities feed
    const recentBorrows = await BorrowHistory.find({})
      .populate('bookId', 'title')
      .populate('userId', 'name')
      .sort({ issueDate: -1 })
      .limit(5);

    const recentActivities = recentBorrows.map(item => ({
      id: item._id,
      type: item.status === 'Issued' ? 'issue' : 'return',
      message: `${item.userId?.name || 'A student'} ${item.status === 'Issued' ? 'borrowed' : 'returned'} "${item.bookId?.title || 'a book'}"`,
      timestamp: item.issueDate
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          students: studentsCount,
          books: booksCount,
          issuedBooks: issuedCount,
          attendanceToday: attendanceTodayCount,
          seatUtilization: totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
          totalSeats
        },
        categories: categoriesStats.map(item => ({ name: item._id, value: item.count })),
        attendanceTrend: attendanceStats.map(item => ({ date: item._id, count: item.count })),
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for a Student
// @route   GET /api/analytics/student/:studentId
// @access  Private
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [
      activeBorrowsCount,
      totalBorrowsCount,
      reservedSeat,
      attendanceLogs
    ] = await Promise.all([
      BorrowHistory.countDocuments({ userId: studentId, status: 'Issued' }),
      BorrowHistory.countDocuments({ userId: studentId }),
      Seat.findOne({ reservedBy: studentId, status: { $ne: 'Available' } }),
      Attendance.find({ studentId })
    ]);

    // Monthly reading history aggregation (last 6 months)
    const readingStats = await BorrowHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: { $month: '$issueDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = readingStats.map(item => ({
      month: months[item._id - 1] || 'Unknown',
      books: item.count
    }));

    // Calculate attendance percentage
    const presentCount = attendanceLogs.length;
    const attendancePercentage = presentCount > 0 ? Math.min(100, Math.round((presentCount / 22) * 100)) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          activeBorrows: activeBorrowsCount,
          totalBorrowed: totalBorrowsCount,
          reservedSeat: reservedSeat ? reservedSeat.seatNumber : 'None',
          attendancePercentage
        },
        monthlyReadingTrend: monthlyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};
