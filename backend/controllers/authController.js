const User = require('../models/User');
const Membership = require('../models/Membership');
const LibraryTiming = require('../models/LibraryTiming');
const FeeRecord = require('../models/FeeRecord');
const whatsappService = require('../utils/whatsappService');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendResetPasswordEmail } = require('../utils/emailService');


// Helper to send mock or actual verification email
const sendVerificationEmail = async (user, code) => {
  // If email configuration is default/empty, run in mock mode
  if (process.env.EMAIL_USER === 'your_email@gmail.com' || !process.env.EMAIL_USER) {
    console.log(`[MOCK EMAIL] Verification code for ${user.email} is: ${code}`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Nalanda Digital Library Library" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Nalanda Digital Library - Email Verification Code',
    text: `Your email verification code is: ${code}. It expires in 15 minutes.`,
    html: `<h3>Welcome to Nalanda Digital Library</h3><p>Your email verification code is: <strong>${code}</strong></p><p>It expires in 15 minutes.</p>`
  };

  await transporter.sendMail(mailOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body; // email here acts as email or phone identifier

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email or phone number' });
    }

    const isEmail = email.includes('@');
    const identifier = email.trim();

    // Check if user exists by email or phone
    let user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate 6 digit verification code (OTP)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Map email/phone correctly
    const finalEmail = isEmail ? identifier : `phone_${identifier.replace(/[^a-zA-Z0-9]/g, '')}@nalanda.com`;
    const finalPhone = isEmail ? null : identifier;

    // Create user
    user = await User.create({
      name,
      email: finalEmail,
      phone: finalPhone,
      password,
      role: role || 'student',
      verificationCode,
      isVerified: false,
      studentId: role === 'student' ? 'LIB-' + Math.floor(100000 + Math.random() * 900000) : undefined
    });

    // Send verification code
    let codeSent = false;
    let demoCode = verificationCode;
    if (isEmail) {
      try {
        await sendVerificationEmail(user, verificationCode);
        codeSent = true;
      } catch (err) {
        console.error('Mail send failed, falling back to mock mode:', err.message);
      }
    } else {
      // Send via Twilio SMS and WhatsApp
      try {
        const { sendSMSAlert } = require('../utils/smsService');
        await sendSMSAlert(finalPhone, `Your Nalanda Digital Library verification OTP is: ${verificationCode}. It expires in 15 minutes.`);
        
        // Try sending WhatsApp
        try {
          await whatsappService.sendAlert(finalPhone, `Your Nalanda Digital Library verification OTP is: ${verificationCode}. It expires in 15 minutes.`);
        } catch (we) {
          console.error('WhatsApp OTP dispatch failed:', we.message);
        }
        codeSent = true;
      } catch (err) {
        console.error('SMS/WhatsApp OTP dispatch failed:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: isEmail 
        ? 'User registered. Please check email for verification code.'
        : 'User registered. Please check your phone for verification OTP.',
      demoCode: codeSent && process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com' ? undefined : demoCode
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email / phone
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body; // email contains either the email or phone number identifier

    const user = await User.findOne({
      $or: [
        { email: email },
        { phone: email }
      ]
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account verified successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email or phone and password' });
    }

    // Check for user by email or phone
    const user = await User.findOne({
      $or: [
        { email: email },
        { phone: email }
      ]
    }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is verified
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your account before logging in' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        faceRegistered: user.faceRegistered
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Validate email format
    if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email });

    // Secure generic response to prevent user enumeration
    const secureSuccessResponse = {
      success: true,
      message: 'If that email is registered, a password reset link has been sent.'
    };

    if (!user) {
      // Still return success to prevent email enumeration
      return res.status(200).json(secureSuccessResponse);
    }

    // Generate secure random reset token (hex format)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing it in the database
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 15 minutes (900,000 ms)
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    
    await user.save();

    // Send the email with the raw resetToken
    try {
      await sendResetPasswordEmail(user.email, user.name, resetToken);
    } catch (err) {
      console.error('Failed to send reset email:', err.message);
      // Clean up fields if email dispatch fails so token is not active
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }

    res.status(200).json(secureSuccessResponse);
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide token and new password' });
    }

    // Password validation: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // Hash the incoming token to match stored token hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password (the pre-save mongoose middleware will hash this with bcrypt)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP to email or phone number (login/signup)
// @route   POST /api/auth/otp/send
// @access  Public
exports.sendOTP = async (req, res, next) => {
  try {
    const { identifier } = req.body; // email or phone
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide email or phone number' });
    }

    const isEmail = identifier.includes('@');
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      // Create a new user (OTP Sign Up)
      const name = isEmail ? identifier.split('@')[0] : `Student_${identifier.slice(-4)}`;
      const email = isEmail ? identifier : `phone_${identifier.replace(/[^a-zA-Z0-9]/g, '')}@nalanda.com`;
      const phone = isEmail ? null : identifier;
      const randomPassword = crypto.randomBytes(8).toString('hex'); // satisfies schema required password

      user = await User.create({
        name,
        email,
        phone,
        password: randomPassword,
        role: 'student',
        verificationCode,
        isVerified: false,
        studentId: 'LIB-' + Math.floor(100000 + Math.random() * 900000),
        membershipStatus: 'Pending',
        joiningDate: new Date()
      });
    } else {
      // User exists (OTP Log In)
      user.verificationCode = verificationCode;
      await user.save();
    }

    // Send OTP code via email or WhatsApp
    let otpSent = false;
    let demoCode = verificationCode;
    if (isEmail) {
      try {
        await sendVerificationEmail(user, verificationCode);
        otpSent = true;
      } catch (err) {
        console.error('OTP email failed to send:', err.message);
      }
    } else {
      // Send WhatsApp
      try {
        await whatsappService.sendAlert(user.phone, `Your Nalanda Digital Library verification OTP is: ${verificationCode}. It expires in 15 minutes.`);
        otpSent = true;
      } catch (err) {
        console.error('OTP WhatsApp failed to send:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${identifier}`,
      demoCode: otpSent && process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com' ? undefined : demoCode
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and log in / sign up user
// @route   POST /api/auth/otp/verify
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { identifier, code } = req.body;
    if (!identifier || !code) {
      return res.status(400).json({ success: false, message: 'Please provide identifier and verification code' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    const isNewUser = !user.isVerified;

    user.isVerified = true;
    user.verificationCode = null;
    user.membershipStatus = 'Active'; // Activate on verification
    await user.save();

    // If it is a new user signup, initialize default membership, timings, and initial fee records
    if (isNewUser) {
      // Create default monthly membership
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month expiry

      await Membership.create({
        user: user._id,
        plan: 'Free',
        membershipType: 'Monthly',
        startDate,
        endDate,
        status: 'Active',
        amountPaid: 0
      });

      // Assign default Morning Shift timing
      await LibraryTiming.create({
        studentId: user._id,
        shiftName: 'Morning Shift',
        startTime: '08:00 AM',
        endTime: '12:00 PM',
        assignedBy: user._id,
        assignedDate: new Date()
      });

      // Create Initial Month Unpaid Fee Record
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      const currentYear = new Date().getFullYear();
      await FeeRecord.create({
        studentId: user._id,
        month: currentMonth,
        year: currentYear,
        admissionFee: 500,
        monthlyFee: 299,
        securityDeposit: 1000,
        amount: 1799,
        status: 'Unpaid'
      });
    }

    // Sign JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        studentId: user.studentId,
        faceRegistered: user.faceRegistered
      }
    });
  } catch (error) {
    next(error);
  }
};

