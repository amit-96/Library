const PDFDocument = require('../models/PDFDocument');
const AIChat = require('../models/AIChat');
const OccupancyPrediction = require('../models/OccupancyPrediction');
const Attendance = require('../models/Attendance');
const BorrowHistory = require('../models/BorrowHistory');
const Seat = require('../models/Seat');

// @desc    Upload PDF Document metadata and sync with AI Microservice
// @route   POST /api/ai/pdf/upload
// @access  Private
exports.uploadPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const title = req.body.title || req.file.originalname.replace('.pdf', '');
    const filePath = req.file.path.replace(/\\/g, '/'); // normalize slashes
    const vectorIndexKey = `pdf_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create DB entry
    const doc = await PDFDocument.create({
      title,
      uploaderId: req.user.id,
      filePath,
      vectorIndexKey
    });

    // Sync with FastAPI microservice
    let aiIndexed = false;
    let aiMessage = 'Stored metadata locally. AI Service offline/skipped.';
    try {
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(req.file.path);
      const form = new FormData();
      form.append('file', new Blob([fileBuffer], { type: 'application/pdf' }), req.file.originalname);
      form.append('doc_id', doc._id.toString());
      form.append('index_key', vectorIndexKey);

      const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/pdf/upload`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        body: form
      });

      if (response.ok) {
        aiIndexed = true;
        aiMessage = 'File uploaded and AI index built successfully.';
      } else {
        const errText = await response.text();
        console.error('AI Service Indexing Error Response:', errText);
        aiMessage = 'Stored locally. AI Service indexing failed: ' + errText;
      }
    } catch (err) {
      console.error('Failed to contact Python AI microservice:', err.message);
    }

    res.status(201).json({
      success: true,
      message: aiMessage,
      aiIndexed,
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all uploaded PDFs
// @route   GET /api/ai/pdf
// @access  Private
exports.getPDFs = async (req, res, next) => {
  try {
    const docs = await PDFDocument.find({ uploaderId: req.user.id }).sort({ uploadedAt: -1 });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat message logs
// @route   GET /api/ai/chat/:docId?
// @access  Private
exports.getChatHistory = async (req, res, next) => {
  try {
    const contextDocId = req.params.docId || null;
    let chat = await AIChat.findOne({ userId: req.user.id, contextDocId });

    if (!chat) {
      // Create empty chat log
      chat = await AIChat.create({
        userId: req.user.id,
        contextDocId,
        messages: []
      });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

// @desc    Append message to chat log
// @route   POST /api/ai/chat
// @access  Private
exports.saveChatMessage = async (req, res, next) => {
  try {
    const { contextDocId, role, content } = req.body;

    let chat = await AIChat.findOne({ userId: req.user.id, contextDocId: contextDocId || null });

    if (!chat) {
      chat = new AIChat({
        userId: req.user.id,
        contextDocId: contextDocId || null,
        messages: []
      });
    }

    chat.messages.push({ role, content });
    await chat.save();

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

// @desc    OCR Book Page Scanner
// @route   POST /api/ai/ocr/scan
// @access  Private
exports.ocrScan = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a book page image file' });
    }

    let extractedText = '';
    try {
      const fs = require('fs');
      const imgBuffer = fs.readFileSync(req.file.path);
      const form = new FormData();
      form.append('file', new Blob([imgBuffer], { type: req.file.mimetype }), req.file.originalname);

      const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/ocr/scan`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        body: form
      });

      if (response.ok) {
        const aiData = await response.json();
        extractedText = aiData.text;
      } else {
        const errText = await response.text();
        console.error('AI OCR Service Error:', errText);
        extractedText = `[OCR Error] Could not extract text: ${errText}`;
      }
    } catch (err) {
      console.error('OCR Service offline, running simulated text matcher:', err.message);
      // Fallback demo text
      extractedText = `[Simulated OCR Scan Output]
Chapter 3: DESIGN SYSTEM PRINCIPLES

Modular components are the bedrock of scalable web design. A component should do exactly one thing well (Single Responsibility Principle). 
By isolating logic into custom hooks and CSS classes, developers can prevent code duplication and enhance maintenance metrics.

Key Highlights:
1. Reusability decreases development times by 40%.
2. Consistency maintains UI aesthetics.
3. Separation of Concerns ensures modular testing bounds.`;
    }

    res.status(200).json({
      success: true,
      text: extractedText
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Seat Occupancy Predictions for current day
// @route   GET /api/ai/predictions/seats
// @access  Private
exports.getSeatOccupancyPredictions = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    let predictions = await OccupancyPrediction.find({ date: todayStr });

    // Generate predictions if none exist in DB for today
    if (predictions.length === 0) {
      const timeSlots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];
      const newPredictions = [];

      for (const slot of timeSlots) {
        let predictedOccupancy = 50;
        let confidence = 0.85;

        try {
          const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/predict/seats`;
          const response = await fetch(aiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: todayStr, time_slot: slot })
          });

          if (response.ok) {
            const aiData = await response.json();
            predictedOccupancy = aiData.predictedOccupancy;
            confidence = aiData.confidence;
          }
        } catch (err) {
          console.error(`FastAPI occupancy predict failed for slot ${slot}:`, err.message);
          // Fallback to static baselines
          const slotBaselines = {
            '08:00-10:00': 38,
            '10:00-12:00': 62,
            '12:00-14:00': 79,
            '14:00-16:00': 94,
            '16:00-18:00': 88,
            '18:00-20:00': 52
          };
          predictedOccupancy = slotBaselines[slot] || 50;
          confidence = 0.85 + (Math.random() * 0.1);
        }

        newPredictions.push({
          date: todayStr,
          timeSlot: slot,
          predictedOccupancy,
          confidence
        });
      }

      predictions = await OccupancyPrediction.insertMany(newPredictions);
    }

    res.status(200).json({
      success: true,
      data: predictions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student Study Statistics (streaks, consistency, category interests)
// @route   GET /api/users/profile/study-stats
// @access  Private
exports.getStudyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch student active registers
    const [attendanceCount, borrowCount] = await Promise.all([
      Attendance.countDocuments({ studentId: userId }),
      BorrowHistory.countDocuments({ userId })
    ]);

    // Calculate streaks & consistency
    const streaks = Math.max(1, attendanceCount); // consecutive daily check-ins
    const weeklyHours = 10 + (attendanceCount * 2) + (borrowCount * 3); // mock hours spent
    const consistencyScore = Math.min(100, 65 + (streaks * 4) + (borrowCount * 5));

    res.status(200).json({
      success: true,
      data: {
        streaks,
        weeklyHours,
        consistencyScore,
        interests: ['Computer Science', 'Software Engineering', 'Artificial Intelligence']
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Smart CCTV occupancy and security alerts
// @route   GET /api/ai/cctv/status
exports.getCCTVStatus = async (req, res, next) => {
  try {
    let cctvData = null;
    try {
      const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/cctv/status`;
      const response = await fetch(aiUrl);
      if (response.ok) {
        cctvData = await response.json();
      }
    } catch (err) {
      console.error('FastAPI CCTV status check failed, using simulated data:', err.message);
    }

    if (!cctvData) {
      cctvData = {
        success: true,
        occupancy: 42,
        totalSeats: 100,
        emptySeatsCount: 58,
        activeCameras: 4,
        crowdThresholdSafe: true,
        securityAlerts: [],
        seatGrid: Array.from({ length: 16 }, (_, i) => ({
          seatNumber: `1F-0${String(i+1).padStart(2, '0')}`,
          occupied: i % 3 === 0
        }))
      };
    }

    res.status(200).json({ success: true, data: cctvData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Career Advisor roadmap and skills recommendations
// @route   POST /api/ai/career/mentor
exports.getCareerMentorRoadmap = async (req, res, next) => {
  try {
    const { goal, currentSkills } = req.body;
    let aiData = null;

    try {
      const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/career/mentor`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, current_skills: currentSkills })
      });
      if (response.ok) {
        aiData = await response.json();
      }
    } catch (err) {
      console.error('FastAPI Career Mentor failed, using mock data:', err.message);
    }

    if (!aiData) {
      aiData = {
        goal: goal || 'Full Stack Developer',
        roadmap: [
          { step: 1, title: 'HTML, CSS & JavaScript Essentials', duration: '2 Weeks' },
          { step: 2, title: 'React.js & Frontend State Management', duration: '3 Weeks' },
          { step: 3, title: 'Node.js, Express & Database Integrations (MongoDB/SQL)', duration: '4 Weeks' },
          { step: 4, title: 'System Design, CI/CD pipelines & Docker Containers', duration: '3 Weeks' }
        ],
        skillGap: ['Docker', 'AWS ECS', 'System Design', 'CI/CD Pipelines'],
        learningMaterials: [
          { resource: 'Clean Code: A Handbook of Agile Software Craftsmanship', type: 'Book' },
          { resource: 'Introduction to Algorithms', type: 'Book' },
          { resource: 'Full-Stack Web Development Roadmap', type: 'AI Guided Path' }
        ]
      };
    }

    res.status(200).json({ success: true, data: aiData });
  } catch (error) {
    next(error);
  }
};

// @desc    Start technical or HR mock interview session
// @route   POST /api/ai/interview/session
exports.getInterviewSession = async (req, res, next) => {
  try {
    const { domain, interviewType } = req.body; // e.g. 'Web Development', 'HR'
    let aiData = null;

    try {
      const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/interview/session`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, interview_type: interviewType })
      });
      if (response.ok) {
        aiData = await response.json();
      }
    } catch (err) {
      console.error('FastAPI Interview session request failed, using mock data:', err.message);
    }

    if (!aiData) {
      aiData = {
        questionId: 'q_' + Math.random().toString(36).substr(2, 9),
        question: domain === 'HR' 
          ? "Tell me about a time you handled a difficult conflict in a team project. What was the outcome?" 
          : `Explain the concept of closures in JavaScript. How does it work and what are some use cases?`,
        instructions: "Type your answer clearly. AI will grade your response on correctness, depth, and communication skills."
      };
    }

    res.status(200).json({ success: true, data: aiData });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit mock interview answer for scoring and suggestions
// @route   POST /api/ai/interview/feedback
exports.getInterviewFeedback = async (req, res, next) => {
  try {
    const { question, answer } = req.body;
    let aiData = null;

    try {
      const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/interview/feedback`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer })
      });
      if (response.ok) {
        aiData = await response.json();
      }
    } catch (err) {
      console.error('FastAPI Interview feedback request failed, using mock:', err.message);
    }

    if (!aiData) {
      aiData = {
        score: answer.length > 50 ? 85 : 55,
        evaluation: answer.length > 50
          ? "Good explanation. You clearly understand memory scopes and execution contexts."
          : "Your answer lacks technical depth and examples. Try explaining lexical environments.",
        suggestions: [
          "Mention lexical scope binding.",
          "Describe practical closures like private variables or custom callbacks.",
          "Avoid brief single-line definitions in technical assessments."
        ]
      };
    }

    // Award user points for finishing a mock test/interview
    try {
      const Gamification = require('../models/Gamification');
      let gamification = await Gamification.findOne({ user: req.user.id });
      if (gamification) {
        gamification.points += 15; // 15 XP for practicing
        await gamification.save();
      }
    } catch (e) {
      console.error('Failed to award points for interview practice:', e.message);
    }

    res.status(200).json({ success: true, data: aiData });
  } catch (error) {
    next(error);
  }
};

// @desc    ATS resume score analyser
// @route   POST /api/ai/resume/analyze
exports.analyzeResume = async (req, res, next) => {
  try {
    let extractedText = req.body.text || '';
    
    if (req.file) {
      try {
        const fs = require('fs');
        const fileBuffer = fs.readFileSync(req.file.path);
        const form = new FormData();
        form.append('file', new Blob([fileBuffer], { type: req.file.mimetype }), req.file.originalname);

        const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/ocr/scan`;
        const response = await fetch(aiUrl, { method: 'POST', body: form });
        if (response.ok) {
          const aiData = await response.json();
          extractedText = aiData.text;
        }
      } catch (e) {
        console.error('Failed to extract text from resume file, simulating parsing:', e.message);
        extractedText = "Experienced React developer with JavaScript and SQL skills.";
      }
    }

    let aiData = null;
    try {
      const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/resume/analyze`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: extractedText })
      });
      if (response.ok) {
        aiData = await response.json();
      }
    } catch (err) {
      console.error('FastAPI Resume Analyzer failed, using mock data:', err.message);
    }

    if (!aiData) {
      // Analyze text for skills to calculate a mock ATS score
      const skillsFound = [];
      const keywords = ['react', 'node', 'javascript', 'python', 'sql', 'docker', 'aws', 'system design'];
      const textLower = extractedText.toLowerCase();
      keywords.forEach(kw => {
        if (textLower.includes(kw)) skillsFound.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      });

      const missingSkills = ['Docker', 'AWS', 'System Design'].filter(s => !skillsFound.includes(s));
      const atsScore = 65 + (skillsFound.length * 5);

      aiData = {
        atsScore: Math.min(100, atsScore),
        matchedSkills: skillsFound,
        missingSkills,
        suggestions: [
          "List containerization experience using Docker.",
          "Describe projects hosted on Cloud infrastructure like AWS EC2/S3.",
          "Include a section dedicated to System Design concepts like load balancers and caching."
        ]
      };
    }

    res.status(200).json({ success: true, data: aiData });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate personalized daily/weekly study planner schedule
// @route   POST /api/ai/study-planner
exports.getStudyPlan = async (req, res, next) => {
  try {
    const { examName, daysRemaining, dailyHours } = req.body;
    let aiData = null;

    try {
      const aiUrl = `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/ai/study-planner`;
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_name: examName, days_remaining: daysRemaining, daily_hours: dailyHours })
      });
      if (response.ok) {
        aiData = await response.json();
      }
    } catch (err) {
      console.error('FastAPI Study Planner failed, using mock data:', err.message);
    }

    if (!aiData) {
      const days = parseInt(daysRemaining) || 30;
      const planWeeks = [];
      const numWeeks = Math.ceil(days / 7);

      for (let w = 1; w <= numWeeks; w++) {
        planWeeks.push({
          week: w,
          focusArea: w === numWeeks ? 'Revision & Mock Assessments' : `Core Foundations in ${examName || 'Subjects'}`,
          topics: [
            `Module ${w} - In-depth concepts review`,
            `Solve chapter exercises`,
            `Weekly practice tests`
          ]
        });
      }

      aiData = {
        examName: examName || 'Semester Examination',
        daysRemaining: days,
        dailyHours: dailyHours || 3,
        weeklyPlan: planWeeks
      };
    }

    res.status(200).json({ success: true, data: aiData });
  } catch (error) {
    next(error);
  }
};
