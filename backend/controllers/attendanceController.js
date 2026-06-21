const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to get formatted date string: YYYY-MM-DD in local time
const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    QR Check-in or Check-out (Student scans QR code)
// @route   POST /api/attendance/qr-checkin
// @access  Private/Student
exports.qrCheckin = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const todayStr = getLocalDateString();

    let record = await Attendance.findOne({ studentId, date: todayStr });

    if (!record) {
      // Check-in
      record = await Attendance.create({
        studentId,
        date: todayStr,
        checkIn: new Date(),
        method: 'QR',
        status: 'Present'
      });

      return res.status(201).json({
        success: true,
        type: 'check-in',
        message: 'Checked-in successfully via QR Code',
        data: record
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked-in and checked-out for today.'
      });
    }

    // Check-out
    record.checkOut = new Date();
    await record.save();

    res.status(200).json({
      success: true,
      type: 'check-out',
      message: 'Checked-out successfully via QR Code',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Face Recognition Check-in/Check-out (Called by FastAPI AI service)
// @route   POST /api/attendance/face-checkin
// @access  Private/Librarian/Admin (or secured internal token)
exports.faceCheckin = async (req, res, next) => {
  try {
    const { studentMongoId } = req.body;

    const student = await User.findById(studentMongoId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const todayStr = getLocalDateString();
    let record = await Attendance.findOne({ studentId: student._id, date: todayStr });

    if (!record) {
      // Check-in
      record = await Attendance.create({
        studentId: student._id,
        date: todayStr,
        checkIn: new Date(),
        method: 'Face',
        status: 'Present'
      });

      return res.status(201).json({
        success: true,
        type: 'check-in',
        message: `Face verification successful. Checked-in ${student.name}`,
        data: record
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: `${student.name} has already checked-out for today.`
      });
    }

    // Check-out
    record.checkOut = new Date();
    await record.save();

    res.status(200).json({
      success: true,
      type: 'check-out',
      message: `Face verification successful. Checked-out ${student.name}`,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance logs (Admin/Librarian report view)
// @route   GET /api/attendance/reports
// @access  Private/Librarian/Admin
exports.getReports = async (req, res, next) => {
  try {
    const logs = await Attendance.find({})
      .populate('studentId', 'name email studentId department')
      .sort({ checkIn: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history and percentage for current student
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own attendance' });
    }

    const logs = await Attendance.find({ studentId }).sort({ checkIn: -1 });

    // Calculate percentage (based on active days, for project presentation, mock dynamic percentage)
    // E.g., if logged 10 entries in a month, say 85% attendance. Let's make a realistic stat.
    const totalDays = 30; // standard month reference
    const presentCount = logs.length;
    const attendancePercentage = Math.min(100, Math.round((presentCount / 22) * 100)); // assume 22 working days

    res.status(200).json({
      success: true,
      percentage: presentCount > 0 ? attendancePercentage : 0,
      logs
    });
  } catch (error) {
    next(error);
  }
};
