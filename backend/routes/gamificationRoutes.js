const express = require('express');
const router = express.Router();
const Gamification = require('../models/Gamification');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

// Helper function: Ensure gamification profile exists
const getOrCreateGamificationProfile = async (userId) => {
  let profile = await Gamification.findOne({ user: userId });
  if (!profile) {
    profile = await Gamification.create({
      user: userId,
      points: 50, // Welcome points
      level: 1,
      badges: ['Book Explorer'],
      streakDays: 1
    });
  }
  return profile;
};

// @desc    Get user stats and badges
// @route   GET /api/gamification/stats
router.get('/stats', async (req, res, next) => {
  try {
    const profile = await getOrCreateGamificationProfile(req.user.id);
    
    // Calculate rank
    const allProfiles = await Gamification.find({}).sort({ points: -1 });
    const rank = allProfiles.findIndex(p => p.user.toString() === req.user.id) + 1;

    res.status(200).json({
      success: true,
      data: {
        points: profile.points,
        level: profile.level,
        badges: profile.badges,
        streakDays: profile.streakDays,
        lastActive: profile.lastActive,
        rank: rank || 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get global leaderboard
// @route   GET /api/gamification/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const leaderboard = await Gamification.find({})
      .populate('user', 'name email department')
      .sort({ points: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add points for activity (internal/student trigger)
// @route   POST /api/gamification/add-points
router.post('/add-points', async (req, res, next) => {
  try {
    const { activityType } = req.body; // e.g. 'book-read', 'mock-test', 'study-streak'
    let pointsToAdd = 10;
    let badgeEarned = null;

    if (activityType === 'book-read') {
      pointsToAdd = 30;
    } else if (activityType === 'mock-test') {
      pointsToAdd = 50;
    } else if (activityType === 'study-streak') {
      pointsToAdd = 20;
    }

    const profile = await getOrCreateGamificationProfile(req.user.id);
    profile.points += pointsToAdd;

    // Check for level ups (every 100 points is 1 level)
    const newLevel = Math.floor(profile.points / 100) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
    }

    // Award badges based on points threshold or activity
    if (profile.points >= 200 && !profile.badges.includes('Top Reader')) {
      profile.badges.push('Top Reader');
      badgeEarned = 'Top Reader';
    }
    if (activityType === 'mock-test' && !profile.badges.includes('AI Learner')) {
      profile.badges.push('AI Learner');
      badgeEarned = 'AI Learner';
    }

    // Update last active date & check streak increment
    const today = new Date().toDateString();
    const lastActiveDate = new Date(profile.lastActive).toDateString();
    
    if (today !== lastActiveDate) {
      profile.streakDays += 1;
    }
    profile.lastActive = Date.now();

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Earned ${pointsToAdd} points!`,
      data: {
        points: profile.points,
        level: profile.level,
        badges: profile.badges,
        streakDays: profile.streakDays,
        badgeEarned
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
