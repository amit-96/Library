const User = require('../models/User');
const Membership = require('../models/Membership');
const LibraryTiming = require('../models/LibraryTiming');
const FeeRecord = require('../models/FeeRecord');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const whatsappService = require('../utils/whatsappService');
const nodemailer = require('nodemailer');

// Helper to calculate expiry date based on membership type
const calculateEndDate = (startDate, type) => {
  const date = new Date(startDate);
  if (type === 'Monthly') date.setMonth(date.getMonth() + 1);
  else if (type === 'Quarterly') date.setMonth(date.getMonth() + 3);
  else if (type === 'Half-Yearly') date.setMonth(date.getMonth() + 6);
  else if (type === 'Yearly') date.setFullYear(date.getFullYear() + 1);
  return date;
};

// Helper for default shift hours
const getShiftHours = (shift) => {
  if (shift === 'Morning') return { start: '08:00 AM', end: '12:00 PM' };
  if (shift === 'Afternoon') return { start: '12:00 PM', end: '04:00 PM' };
  if (shift === 'Evening') return { start: '04:00 PM', end: '08:00 PM' };
  return { start: '08:00 AM', end: '12:00 PM' }; // default Morning
};

// Helper to calculate student membership fee based on flyer timing matrix
const calculateMembershipFee = (shift, membershipType) => {
  const s = (shift || 'Morning').toLowerCase();
  
  let shiftType = '6h';
  if (s.includes('24') || s.includes('full')) {
    shiftType = '24h';
  } else if (s.includes('12') || s.includes('full day')) {
    shiftType = '12h';
  } else if (s.includes('night')) {
    shiftType = 'night';
  }

  const matrix = {
    '24h': {
      'Monthly': 599,
      'Quarterly': 1499,
      'Half-Yearly': 2999,
      'Yearly': 5999
    },
    '12h': {
      'Monthly': 499,
      'Quarterly': 1249,
      'Half-Yearly': 2499,
      'Yearly': 4999
    },
    '6h': {
      'Monthly': 299,
      'Quarterly': 749,
      'Half-Yearly': 1499,
      'Yearly': 2999
    },
    'night': {
      'Monthly': 299,
      'Quarterly': 749,
      'Half-Yearly': 1499,
      'Yearly': 2999
    }
  };

  const cycle = membershipType || 'Monthly';
  if (matrix[shiftType] && matrix[shiftType][cycle]) {
    return matrix[shiftType][cycle];
  }
  
  return cycle === 'Yearly' ? 2999 : (cycle === 'Half-Yearly' ? 1499 : (cycle === 'Quarterly' ? 749 : 299));
};

// @desc    Add a new student profile and initialize membership, shift, and initial fees
// @route   POST /api/students
// @access  Private (Admin/Librarian)
exports.addStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      dateOfBirth,
      department,
      course,
      year,
      semester,
      address,
      profilePhoto,
      rollNumber,
      registrationNumber,
      membershipType,
      libraryShift,
      joiningDate
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Student with this email already exists' });
    }

    if (rollNumber) {
      const rollExists = await User.findOne({ rollNumber });
      if (rollExists) {
        return res.status(400).json({ success: false, message: 'Student with this Roll Number already exists' });
      }
    }

    // Auto-generate IDs
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const studentId = `LIB-${randomSuffix}`;
    const membershipNumber = `MEM-${randomSuffix}`;

    // Create student user account
    const student = await User.create({
      name,
      email,
      password: password || 'libra123', // default password
      role: 'student',
      isVerified: true,
      studentId,
      rollNumber,
      registrationNumber,
      gender,
      dateOfBirth,
      department,
      course,
      year,
      semester,
      address,
      profilePhoto,
      phone,
      membershipNumber,
      joiningDate: joiningDate || new Date(),
      membershipStatus: 'Active',
      libraryShift: libraryShift || 'Morning'
    });

    // Initialize Membership record
    const mStartDate = joiningDate ? new Date(joiningDate) : new Date();
    const mEndDate = calculateEndDate(mStartDate, membershipType || 'Monthly');

    const membership = await Membership.create({
      user: student._id,
      plan: 'Free', // dynamic SaaS tier
      membershipType: membershipType || 'Monthly',
      startDate: mStartDate,
      endDate: mEndDate,
      status: 'Active',
      amountPaid: 0
    });

    // Initialize Timing Shift Assignment
    const shiftHours = getShiftHours(libraryShift || 'Morning');
    await LibraryTiming.create({
      studentId: student._id,
      shiftName: `${libraryShift || 'Morning'} Shift`,
      startTime: shiftHours.start,
      endTime: shiftHours.end,
      assignedBy: req.user.id,
      assignedDate: new Date()
    });

    // Create Initial Month Unpaid Fee Record (includes Admission, Monthly Fee, and Security Deposit)
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const monthlyFeeAmount = calculateMembershipFee(libraryShift, membershipType);
    
    await FeeRecord.create({
      studentId: student._id,
      month: currentMonth,
      year: currentYear,
      admissionFee: 500,
      monthlyFee: monthlyFeeAmount,
      securityDeposit: 1000,
      amount: 1500 + monthlyFeeAmount,
      status: 'Unpaid'
    });

    res.status(201).json({
      success: true,
      message: 'Student account created and initialized successfully!',
      data: {
        student,
        membership
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all students with search and filters
// @route   GET /api/students
// @access  Private (Admin/Librarian)
exports.listStudents = async (req, res, next) => {
  try {
    const { department, course, libraryShift, membershipStatus, search } = req.query;
    const query = { role: 'student' };

    if (department) query.department = department;
    if (course) query.course = course;
    if (libraryShift) query.libraryShift = libraryShift;
    if (membershipStatus) query.membershipStatus = membershipStatus;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed student profile (tabs metadata consolidated)
// @route   GET /api/students/:id
// @access  Private
exports.getStudentProfile = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Enforce role check: students can only fetch their own profile
    if (req.user.role === 'student' && req.user.id !== student.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    // Fetch related records
    const [membership, timing, feeHistory, attendanceList] = await Promise.all([
      Membership.findOne({ user: student._id }),
      LibraryTiming.findOne({ studentId: student._id }).sort({ assignedDate: -1 }),
      FeeRecord.find({ studentId: student._id }).sort({ year: -1, createdAt: -1 }),
      Attendance.find({ studentId: student._id }).sort({ date: -1 })
    ]);

    // Calculate attendance percentage
    const presentCount = attendanceList.filter(a => a.status === 'Present').length;
    const absentCount = attendanceList.filter(a => a.status === 'Absent').length;
    const totalDays = presentCount + absentCount;
    const attendancePercentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100;

    res.status(200).json({
      success: true,
      data: {
        student,
        membership,
        timing,
        feeHistory,
        attendance: {
          logs: attendanceList,
          presentCount,
          absentCount,
          percentage: attendancePercentage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit student details (personal, semester, contact, membership/shift status)
// @route   PUT /api/students/:id
// @access  Private (Admin/Librarian)
exports.editStudent = async (req, res, next) => {
  try {
    let student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { libraryShift, membershipStatus, ...updateFields } = req.body;

    // Handle shift timing logs if libraryShift is updated
    if (libraryShift && libraryShift !== student.libraryShift) {
      const shiftHours = getShiftHours(libraryShift);
      await LibraryTiming.create({
        studentId: student._id,
        shiftName: `${libraryShift} Shift`,
        startTime: shiftHours.start,
        endTime: shiftHours.end,
        assignedBy: req.user.id,
        assignedDate: new Date()
      });
      student.libraryShift = libraryShift;
    }

    // Handle membership status modifications
    if (membershipStatus && membershipStatus !== student.membershipStatus) {
      student.membershipStatus = membershipStatus;
      await Membership.findOneAndUpdate(
        { user: student._id },
        { status: membershipStatus },
        { new: true }
      );
    }

    // Apply other updates
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        student[key] = updateFields[key];
      }
    });

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully!',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove student and linked database logs
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await Promise.all([
      User.findByIdAndDelete(student._id),
      Membership.findOneAndDelete({ user: student._id }),
      LibraryTiming.deleteMany({ studentId: student._id }),
      FeeRecord.deleteMany({ studentId: student._id }),
      Attendance.deleteMany({ studentId: student._id })
    ]);

    res.status(200).json({
      success: true,
      message: 'Student and all related records deleted successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign custom library timing or shift configurations
// @route   POST /api/students/:id/timing
// @access  Private (Admin/Librarian)
exports.assignTiming = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { shiftName, startTime, endTime } = req.body;

    const timing = await LibraryTiming.create({
      studentId: student._id,
      shiftName: shiftName || 'Custom Timing',
      startTime,
      endTime,
      assignedBy: req.user.id,
      assignedDate: new Date()
    });

    // Update libraryShift descriptor flag
    student.libraryShift = shiftName && shiftName.includes('Shift') ? shiftName.replace(' Shift', '') : 'Custom';
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Library shifts assigned successfully!',
      data: timing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign membership tier durations and renew periods
// @route   POST /api/students/:id/membership
// @access  Private (Admin/Librarian)
exports.updateMembershipPlan = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { membershipType, startDate, status } = req.body;

    const m = await Membership.findOne({ user: student._id });
    if (!m) {
      return res.status(404).json({ success: false, message: 'Membership profile not found' });
    }

    const mStartDate = startDate ? new Date(startDate) : new Date();
    const mEndDate = calculateEndDate(mStartDate, membershipType || m.membershipType);

    m.membershipType = membershipType || m.membershipType;
    m.startDate = mStartDate;
    m.endDate = mEndDate;
    if (status) m.status = status;
    await m.save();

    // Sync User flags
    if (status) {
      student.membershipStatus = status;
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'Membership parameters updated successfully!',
      data: m
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update a month-wise fee payment
// @route   POST /api/students/:id/fees
// @access  Private (Admin/Librarian)
exports.collectFees = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { month, year, admissionFee, monthlyFee, securityDeposit, amount, paymentMethod, transactionId, status } = req.body;

    // Check if fee record already exists for this month/year
    let fee = await FeeRecord.findOne({ studentId: student._id, month, year });

    if (fee) {
      // Update existing record
      fee.admissionFee = admissionFee !== undefined ? admissionFee : fee.admissionFee;
      fee.monthlyFee = monthlyFee !== undefined ? monthlyFee : fee.monthlyFee;
      fee.securityDeposit = securityDeposit !== undefined ? securityDeposit : fee.securityDeposit;
      fee.amount = amount !== undefined ? amount : fee.amount;
      fee.paymentMethod = paymentMethod || fee.paymentMethod;
      fee.transactionId = transactionId !== undefined ? transactionId : fee.transactionId;
      fee.status = status || fee.status;
      fee.paymentDate = status === 'Paid' ? new Date() : fee.paymentDate;
      await fee.save();
    } else {
      // Create new record
      fee = await FeeRecord.create({
        studentId: student._id,
        month,
        year,
        admissionFee: admissionFee || 0,
        monthlyFee: monthlyFee || 0,
        securityDeposit: securityDeposit || 0,
        amount: amount || (Number(admissionFee || 0) + Number(monthlyFee || 0) + Number(securityDeposit || 0)),
        paymentMethod: paymentMethod || 'Cash',
        transactionId: transactionId || '',
        status: status || 'Unpaid',
        paymentDate: status === 'Paid' ? new Date() : null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee payment logged successfully!',
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete fee collections dashboard statistics
// @route   GET /api/students/dashboard/fees
// @access  Private (Admin/Librarian)
exports.getFeesDashboard = async (req, res, next) => {
  try {
    // Total Students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Aggregate Fee records
    const feeRecords = await FeeRecord.find();

    let totalFeesCollected = 0;
    let pendingFees = 0;
    let overduePayments = 0;

    feeRecords.forEach(record => {
      if (record.status === 'Paid') {
        totalFeesCollected += record.amount;
      } else if (record.status === 'Unpaid') {
        pendingFees += record.amount;
      } else if (record.status === 'Overdue') {
        overduePayments += record.amount;
      }
    });

    // Calculate monthly collections dataset for charts
    const monthlyMap = {};
    const statusMap = { Paid: 0, Unpaid: 0, Overdue: 0 };

    feeRecords.forEach(record => {
      statusMap[record.status] = (statusMap[record.status] || 0) + 1;

      const key = `${record.month} ${record.year}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { collected: 0, pending: 0 };
      }
      if (record.status === 'Paid') {
        monthlyMap[key].collected += record.amount;
      } else {
        monthlyMap[key].pending += record.amount;
      }
    });

    const monthlyCollectionReport = Object.keys(monthlyMap).map(key => ({
      month: key,
      collected: monthlyMap[key].collected,
      pending: monthlyMap[key].pending
    }));

    // Find defaulters list
    const defaulterRecords = await FeeRecord.find({
      status: { $in: ['Unpaid', 'Overdue'] }
    }).populate('studentId', 'name studentId email phone course semester');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalFeesCollected,
          pendingFees,
          overduePayments,
          monthlyRevenue: totalFeesCollected / 12 // average mock monthly
        },
        monthlyCollectionReport,
        statusBreakdown: [
          { name: 'Paid', value: statusMap.Paid || 0 },
          { name: 'Unpaid', value: statusMap.Unpaid || 0 },
          { name: 'Overdue', value: statusMap.Overdue || 0 }
        ],
        defaulters: defaulterRecords
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger email/WhatsApp/in-app reminders for overdue/pending fee balances
// @route   POST /api/students/fees/reminders
// @access  Private (Admin/Librarian)
exports.triggerFeeReminders = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const currentMonth = month || new Date().toLocaleString('default', { month: 'long' });
    const currentYear = year || new Date().getFullYear();

    // Find unpaid/overdue records
    const defaulters = await FeeRecord.find({
      month: currentMonth,
      year: currentYear,
      status: { $in: ['Unpaid', 'Overdue'] }
    }).populate('studentId');

    let count = 0;
    const alertsList = [];

    for (const record of defaulters) {
      const student = record.studentId;
      if (!student) continue;

      count++;
      const messageText = `Dear ${student.name}, this is a friendly reminder that your library membership fee for ${currentMonth} ${currentYear} of Amount Rs. ${record.amount} is currently ${record.status.toUpperCase()}. Please clear your dues at the issue desk.`;

      // 1. Create In-App Notification
      await Notification.create({
        recipient: student._id,
        title: 'Fee Payment Alert ⚠️',
        message: messageText,
        type: 'General'
      });

      // 2. Dispatch Mock WhatsApp Message
      if (student.phone) {
        try {
          await whatsappService.sendAlert(student.phone, messageText);
        } catch (we) {
          console.error(`WhatsApp fail to ${student.phone}:`, we.message);
        }

        // Dispatch SMS Alert
        try {
          const smsService = require('../utils/smsService');
          await smsService.sendAlert(student.phone, messageText);
        } catch (se) {
          console.error(`SMS fail to ${student.phone}:`, se.message);
        }
      }

      // 3. Dispatch Mock Email Alert
      alertsList.push({
        student: student.name,
        email: student.email,
        amount: record.amount,
        status: record.status
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed and dispatched ${count} reminders across Channels (Email, WhatsApp, In-App Notifications)!`,
      recipients: alertsList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log manual check-in or check-out attendance records
// @route   POST /api/students/:id/attendance/manual
// @access  Private (Admin/Librarian)
exports.manualAttendanceEntry = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { date, checkInTime, checkOutTime, status } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let attendance = await Attendance.findOne({ studentId: student._id, date: targetDate });

    if (attendance) {
      if (checkInTime) attendance.checkIn = new Date(`${targetDate}T${checkInTime}`);
      if (checkOutTime) attendance.checkOut = new Date(`${targetDate}T${checkOutTime}`);
      if (status) attendance.status = status;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        studentId: student._id,
        date: targetDate,
        checkIn: checkInTime ? new Date(`${targetDate}T${checkInTime}`) : new Date(),
        checkOut: checkOutTime ? new Date(`${targetDate}T${checkOutTime}`) : null,
        method: 'QR', // custom manual flag
        status: status || 'Present'
      });
    }

    // Award XP points for checking in manually
    try {
      const Gamification = require('../models/Gamification');
      let gam = await Gamification.findOne({ user: student._id });
      if (gam) {
        gam.points += 5; // 5 XP for attendance checkin
        await gam.save();
      }
    } catch (e) {
      console.error('Points award fail:', e.message);
    }

    res.status(200).json({
      success: true,
      message: 'Manual attendance log saved successfully!',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall student, fee, or attendance reports
// @route   GET /api/students/reports/export
// @access  Private (Admin/Librarian)
exports.getReports = async (req, res, next) => {
  try {
    const { reportType } = req.query; // 'student', 'membership', 'fee', 'defaulters', 'attendance'

    let reportData = [];

    if (reportType === 'student') {
      reportData = await User.find({ role: 'student' })
        .select('name studentId email phone course semester department joiningDate membershipStatus libraryShift');
    } else if (reportType === 'membership') {
      reportData = await Membership.find()
        .populate('user', 'name studentId email course')
        .sort({ endDate: 1 });
    } else if (reportType === 'fee' || reportType === 'defaulters') {
      const filter = reportType === 'defaulters' ? { status: { $in: ['Unpaid', 'Overdue'] } } : {};
      reportData = await FeeRecord.find(filter)
        .populate('studentId', 'name studentId email course semester')
        .sort({ year: -1, createdAt: -1 });
    } else if (reportType === 'attendance') {
      reportData = await Attendance.find()
        .populate('studentId', 'name studentId email course')
        .sort({ date: -1 });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type requested.' });
    }

    res.status(200).json({
      success: true,
      reportType,
      generatedAt: new Date(),
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};
