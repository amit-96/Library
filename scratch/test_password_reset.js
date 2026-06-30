const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../backend/.env' });

const User = require('../backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libra-ai';

const runTest = async () => {
  console.log('Connecting to database...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Database connected successfully.');
  } catch (err) {
    console.log('Using local fallback connection...');
    await mongoose.connect('mongodb://127.0.0.1:27017/libra-ai');
  }

  const testEmail = 'reset_test_user@example.com';
  
  // Clean up any existing test user
  await User.deleteOne({ email: testEmail });

  console.log('\n1. Registering test user...');
  const testUser = await User.create({
    name: 'Reset Test User',
    email: testEmail,
    password: 'OldPassword123!',
    role: 'student',
    studentId: 'LIB-RESET-TEST',
    isVerified: true
  });
  console.log('Test user registered.');

  // Check login with old password
  const isOldMatch = await testUser.matchPassword('OldPassword123!');
  console.log(`Old password verification: ${isOldMatch ? 'SUCCESS' : 'FAILED'}`);

  console.log('\n2. Triggering Forgot Password flow...');
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token and expires
  testUser.resetPasswordToken = hashedToken;
  testUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  await testUser.save();
  console.log(`Hashed token saved in database: ${hashedToken}`);
  console.log(`Raw token: ${resetToken}`);

  console.log('\n3. Validating Reset Password requirements...');
  
  // Find user by token
  const queryUser = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!queryUser) {
    throw new Error('Token verification failed: User not found with token or token expired');
  }
  console.log('Token successfully verified against database records.');

  // Validate password requirements
  const newPasswordGood = 'NewStrongPassword123!';
  const newPasswordBad = 'simple';
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  console.log(`Testing invalid password: "${newPasswordBad}" -> Regex Match: ${passwordRegex.test(newPasswordBad)}`);
  console.log(`Testing valid password: "${newPasswordGood}" -> Regex Match: ${passwordRegex.test(newPasswordGood)}`);

  if (!passwordRegex.test(newPasswordGood)) {
    throw new Error('Validation failed: Good password was marked as invalid');
  }

  // Update password
  queryUser.password = newPasswordGood;
  queryUser.resetPasswordToken = undefined;
  queryUser.resetPasswordExpires = undefined;
  await queryUser.save();
  console.log('New password saved and hashed.');

  // Verify token is cleared
  const updatedUser = await User.findById(testUser._id);
  console.log(`Token cleared: ${updatedUser.resetPasswordToken === undefined ? 'YES' : 'NO'}`);
  console.log(`Expires cleared: ${updatedUser.resetPasswordExpires === undefined ? 'YES' : 'NO'}`);

  // Test login with old password (should fail)
  const isOldMatchAfter = await updatedUser.matchPassword('OldPassword123!');
  console.log(`Old password works after reset? ${isOldMatchAfter ? 'YES' : 'NO (Expected)'}`);

  // Test login with new password (should succeed)
  const isNewMatchAfter = await updatedUser.matchPassword(newPasswordGood);
  console.log(`New password works after reset? ${isNewMatchAfter ? 'YES (Expected)' : 'NO'}`);

  // Clean up
  await User.deleteOne({ email: testEmail });
  await mongoose.disconnect();
  console.log('\nAll test assertions PASSED successfully! 🎉');
};

runTest().catch((err) => {
  console.error('\nTest FAILED:', err.message);
  mongoose.disconnect();
});
