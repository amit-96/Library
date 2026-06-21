const Seat = require('../models/Seat');
const StudyRoom = require('../models/StudyRoom');

// @desc    Get all seats
// @route   GET /api/seats
// @access  Private
exports.getSeats = async (req, res, next) => {
  try {
    const seats = await Seat.find({}).populate('reservedBy', 'name email studentId');
    res.status(200).json({
      success: true,
      count: seats.length,
      data: seats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reserve a seat
// @route   POST /api/seats/reserve
// @access  Private/Student
exports.reserveSeat = async (req, res, next) => {
  try {
    const { seatNumber, durationHours = 2 } = req.body;
    const userId = req.user.id;

    // Check if user already has an active reservation
    const activeSeat = await Seat.findOne({ reservedBy: userId, status: { $ne: 'Available' } });
    if (activeSeat) {
      return res.status(400).json({ success: false, message: `You already have reserved seat: ${activeSeat.seatNumber}` });
    }

    const seat = await Seat.findOne({ seatNumber });
    if (!seat) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    if (seat.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Seat is already reserved or occupied' });
    }

    const reservationStart = new Date();
    const reservationEnd = new Date();
    reservationEnd.setHours(reservationEnd.getHours() + parseInt(durationHours));

    seat.status = 'Reserved';
    seat.reservedBy = userId;
    seat.reservationStart = reservationStart;
    seat.reservationEnd = reservationEnd;
    await seat.save();

    // WhatsApp Alert
    const { sendWhatsAppAlert } = require('../utils/whatsappService');
    const phone = req.user.phone || '+919999999999';
    const formattedEnd = reservationEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sendWhatsAppAlert(phone, `🪑 *Seat Reservation Confirmed*\n\n*Seat*: ${seat.seatNumber}\n*Expires at*: ${formattedEnd}\n\nEnsure to check-in before the reservation expires!`);

    res.status(200).json({
      success: true,
      message: `Seat ${seatNumber} reserved successfully`,
      data: seat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel seat reservation
// @route   POST /api/seats/cancel
// @access  Private
exports.cancelReservation = async (req, res, next) => {
  try {
    const { seatNumber } = req.body;

    const seat = await Seat.findOne({ seatNumber });
    if (!seat) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    // Students can only cancel their own reservations; Librarians/Admins can cancel any
    if (req.user.role === 'student' && seat.reservedBy?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this reservation' });
    }

    seat.status = 'Available';
    seat.reservedBy = null;
    seat.reservationStart = null;
    seat.reservationEnd = null;
    await seat.save();

    res.status(200).json({
      success: true,
      message: `Reservation for seat ${seatNumber} cancelled successfully`,
      data: seat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get study rooms
// @route   GET /api/study-rooms
// @access  Private
exports.getStudyRooms = async (req, res, next) => {
  try {
    const rooms = await StudyRoom.find({}).populate('reservedBy', 'name email studentId');
    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reserve a study room
// @route   POST /api/study-rooms/reserve
// @access  Private
exports.reserveStudyRoom = async (req, res, next) => {
  try {
    const { roomId, startTime, endTime } = req.body;
    const userId = req.user.id;

    const room = await StudyRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found' });
    }

    if (room.status === 'Reserved') {
      return res.status(400).json({ success: false, message: 'Study room is already reserved' });
    }

    room.status = 'Reserved';
    room.reservedBy = userId;
    room.startTime = new Date(startTime);
    room.endTime = new Date(endTime);
    await room.save();

    // WhatsApp Alert
    const { sendWhatsAppAlert } = require('../utils/whatsappService');
    const phone = req.user.phone || '+919999999999';
    const formattedEnd = room.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sendWhatsAppAlert(phone, `🚪 *Study Room Reservation Confirmed*\n\n*Room*: ${room.name}\n*Ends at*: ${formattedEnd}\n\nHave a productive study session!`);

    res.status(200).json({
      success: true,
      message: `Study room ${room.name} reserved successfully`,
      data: room
    });
  } catch (error) {
    next(error);
  }
};
