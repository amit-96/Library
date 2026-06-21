const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const { protect } = require('../middleware/auth');

router.use(protect);

// Helper function: Ensure profile exists
const getOrCreateMembership = async (userId) => {
  let membership = await Membership.findOne({ user: userId });
  if (!membership) {
    membership = await Membership.create({
      user: userId,
      plan: 'Free',
      status: 'Active',
      amountPaid: 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }
  return membership;
};

// @desc    Get current membership details
// @route   GET /api/membership/status
router.get('/status', async (req, res, next) => {
  try {
    const membership = await getOrCreateMembership(req.user.id);
    res.status(200).json({
      success: true,
      data: membership
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upgrade membership tier (simulated checkout payment gateway)
// @route   POST /api/membership/upgrade
router.post('/upgrade', async (req, res, next) => {
  try {
    const { plan, paymentId = 'pay_' + Math.random().toString(36).substr(2, 9), amount } = req.body;

    if (!['Free', 'Premium', 'Enterprise'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const membership = await getOrCreateMembership(req.user.id);
    membership.plan = plan;
    membership.status = 'Active';
    membership.paymentId = paymentId;
    membership.amountPaid = amount || (plan === 'Premium' ? 499 : 1999);
    membership.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 more days
    await membership.save();

    res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${plan} membership!`,
      data: membership
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
