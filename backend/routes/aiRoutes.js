const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const {
  uploadPDF,
  getPDFs,
  getChatHistory,
  saveChatMessage,
  ocrScan,
  getSeatOccupancyPredictions,
  getStudyStats,
  getCCTVStatus,
  getCareerMentorRoadmap,
  getInterviewSession,
  getInterviewFeedback,
  analyzeResume,
  getStudyPlan
} = require('../controllers/aiController');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (PDFs and Images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(protect);

router.post('/pdf/upload', upload.single('file'), uploadPDF);
router.get('/pdf', getPDFs);
router.get('/chat/:docId?', getChatHistory);
router.post('/chat', saveChatMessage);
router.get('/cctv/status', getCCTVStatus);
router.post('/career/mentor', getCareerMentorRoadmap);
router.post('/interview/session', getInterviewSession);
router.post('/interview/feedback', getInterviewFeedback);
router.post('/resume/analyze', upload.single('file'), analyzeResume);
router.post('/study-planner', getStudyPlan);

module.exports = router;
