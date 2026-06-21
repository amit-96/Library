const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// @desc    Get all jobs
// @route   GET /api/jobs
router.get('/', async (req, res, next) => {
  try {
    const jobs = await Job.find({}).sort({ postedDate: -1 });
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get matching jobs based on skills or user profiles
// @route   GET /api/jobs/matches
router.get('/matches', async (req, res, next) => {
  try {
    // If student department is Computer Science, look for tech-related jobs
    let query = {};
    if (req.user.department === 'Computer Science') {
      query = {
        $or: [
          { requiredSkills: { $in: ['React', 'Node.js', 'Python', 'Machine Learning', 'SQL', 'Git', 'AWS'] } },
          { title: { $regex: /Software|Web|Developer|Data|AI|Cloud/i } }
        ]
      };
    }

    const matchedJobs = await Job.find(query).sort({ postedDate: -1 });
    
    // Fallback: If no matched jobs found, return all available jobs
    if (matchedJobs.length === 0) {
      const allJobs = await Job.find({}).sort({ postedDate: -1 });
      return res.status(200).json({ success: true, count: allJobs.length, data: allJobs });
    }

    res.status(200).json({
      success: true,
      count: matchedJobs.length,
      data: matchedJobs
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Post a new job (Librarians/Admins only)
// @route   POST /api/jobs
router.post('/', authorize('librarian', 'admin'), async (req, res, next) => {
  try {
    const { title, company, description, requiredSkills, location, link } = req.body;

    const job = await Job.create({
      title,
      company,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim()),
      location: location || 'Remote',
      link: link || '#'
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
