const express = require('express');
const router = express.Router();
const {
  getSeats,
  reserveSeat,
  cancelReservation,
  getStudyRooms,
  reserveStudyRoom
} = require('../controllers/seatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getSeats);
router.post('/reserve', reserveSeat);
router.post('/cancel', cancelReservation);

router.get('/study-rooms', getStudyRooms);
router.post('/study-rooms/reserve', reserveStudyRoom);

module.exports = router;
