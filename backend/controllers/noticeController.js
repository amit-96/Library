const Notice = require('../models/Notice');
const Notification = require('../models/Notification');

// @desc    Get all active notices
// @route   GET /api/notices
// @access  Private
exports.getNotices = async (req, res, next) => {
  try {
    const today = new Date();
    // Fetch notices that are active (scheduled date in past, expiry in future or null)
    const notices = await Notice.find({
      scheduledFor: { $lte: today },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: today } }]
    })
      .populate('publishedBy', 'name role')
      .sort({ scheduledFor: -1 });

    res.status(200).json({
      success: true,
      data: notices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private/Librarian/Admin
exports.createNotice = async (req, res, next) => {
  try {
    const { title, content, scheduledFor, expiresAt } = req.body;

    const notice = await Notice.create({
      title,
      content,
      scheduledFor: scheduledFor || undefined,
      expiresAt: expiresAt || undefined,
      publishedBy: req.user.id
    });

    // Notify all students
    const User = require('../models/User');
    const students = await User.find({ role: 'student' });

    if (students.length > 0) {
      // 1. Create In-App Notifications
      const notifications = students.map(student => ({
        userId: student._id,
        title: `New Notice: ${title}`,
        message: content.length > 80 ? content.substring(0, 80) + '...' : content,
        type: 'Notice'
      }));
      await Notification.insertMany(notifications);

      // 2. Mock Email Notifications Channel
      students.forEach(student => {
        console.log(`[EMAIL NOTIFICATION] Sent Notice Alert to ${student.email} | Title: "${title}"`);
      });

      // 3. Send WhatsApp alerts
      const { sendWhatsAppAlert } = require('../utils/whatsappService');
      const { sendSMSAlert } = require('../utils/smsService');
      students.forEach(student => {
        const phone = student.phone || '+919999999999'; // default mock number
        sendWhatsAppAlert(phone, `🔔 *New Notice Alert*\n\n*Title*: ${title}\n\n${content.length > 150 ? content.substring(0, 150) + '...' : content}`);
        sendSMSAlert(phone, `🔔 New Notice Alert. Title: ${title}. Check your dashboard for details!`);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Notice published and students notified successfully',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private/Librarian/Admin
exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notifications for current user
// @route   GET /api/notices/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notices/notifications/read
// @access  Private
exports.markNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};
