const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// All routes here are protected and restricted to Admin
router.use(protect);
router.use(authorize('admin'));

// @desc    Get all users
// @route   GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user role and face profiles
// @route   PUT /api/users/:id/role
router.put('/:id/role', async (req, res, next) => {
  try {
    const { role, faceEmbeddings, faceRegistered } = req.body;
    
    const updateData = {};
    if (role) {
      if (!['student', 'librarian', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      updateData.role = role;
    }
    
    if (faceRegistered !== undefined) {
      updateData.faceRegistered = faceRegistered;
    }
    
    if (faceEmbeddings !== undefined) {
      updateData.faceEmbeddings = faceEmbeddings;
      
      // Sync to FaceProfile model
      const FaceProfile = require('../models/FaceProfile');
      await FaceProfile.findOneAndUpdate(
        { studentId: req.params.id },
        { studentId: req.params.id, faceEncoding: faceEmbeddings },
        { upsert: true, new: true }
      );
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
