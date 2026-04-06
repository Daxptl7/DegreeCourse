import User from '../models/User.js';
import LoginActivity from '../models/LoginActivity.js';
import { ADMIN_ROLES, APPROVAL_STATUS, ROLES, USER_STATUS } from '../config/roles.js';
import { logLoginAttempt } from '../services/admin-log.service.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

const buildSuspiciousLoginMetadata = async (email, req) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
  const normalizedEmail = String(email || '').toLowerCase();

  const failures = await LoginActivity.countDocuments({
    email: normalizedEmail,
    ipAddress,
    status: 'failure',
    createdAt: { $gte: oneHourAgo }
  });

  if (failures >= 3) {
    return {
      suspicious: true,
      detectedRules: ['multiple_failed_attempts']
    };
  }

  return {
    suspicious: false,
    detectedRules: []
  };
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, school } = req.body;
    const normalizedRole = role || ROLES.STUDENT;

    if (ADMIN_ROLES.includes(normalizedRole)) {
      return sendError(res, 403, 'Admin accounts can only be provisioned internally');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'User already exists');
    }

    // Create user
    const personId = 'PDEU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const approvalStatus = normalizedRole === ROLES.TEACHER
      ? APPROVAL_STATUS.PENDING
      : APPROVAL_STATUS.APPROVED;
    
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: normalizedRole,
      school,
      personId,
      approvalStatus
    });

    if (normalizedRole === ROLES.TEACHER) {
      return sendSuccess(res, 201, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school,
        approvalStatus: user.approvalStatus,
        requiresApproval: true
      }, 'Teacher registration submitted for admin approval');
    }

    const token = generateToken(user._id);

    sendSuccess(res, 201, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
      approvalStatus: user.approvalStatus,
      token
    }, 'User registered successfully');

  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase();

    // Check for user and include password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      const suspiciousMetadata = await buildSuspiciousLoginMetadata(normalizedEmail, req);

      await logLoginAttempt({
        email: normalizedEmail,
        status: 'failure',
        reason: 'invalid_credentials',
        req,
        ...suspiciousMetadata
      });

      return sendError(res, 401, 'Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      const suspiciousMetadata = await buildSuspiciousLoginMetadata(user.email, req);

      await logLoginAttempt({
        user,
        status: 'failure',
        reason: 'invalid_credentials',
        req,
        ...suspiciousMetadata
      });

      return sendError(res, 401, 'Invalid credentials');
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      await logLoginAttempt({
        user,
        status: 'failure',
        reason: 'account_suspended',
        req
      });

      return sendError(res, 403, 'Your account is suspended. Please contact support.');
    }

    if (user.role === ROLES.TEACHER && user.approvalStatus === APPROVAL_STATUS.PENDING) {
      await logLoginAttempt({
        user,
        status: 'failure',
        reason: 'teacher_approval_pending',
        req
      });

      return sendError(res, 403, 'Your teacher account is awaiting admin approval.');
    }

    if (user.role === ROLES.TEACHER && user.approvalStatus === APPROVAL_STATUS.REJECTED) {
      await logLoginAttempt({
        user,
        status: 'failure',
        reason: 'teacher_approval_rejected',
        req
      });

      return sendError(res, 403, 'Your teacher account request was rejected. Please contact the admin team.');
    }

    // Generate token
    const token = generateToken(user._id);

    user.lastLoginAt = Date.now();
    user.lastLoginIp = req.ip || req.headers['x-forwarded-for'] || '';
    await user.save({ validateBeforeSave: false });

    await logLoginAttempt({
      user,
      status: 'success',
      reason: 'login_success',
      req
    });

    sendSuccess(res, 200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
      status: user.status,
      approvalStatus: user.approvalStatus,
      lastLoginAt: user.lastLoginAt,
      token
    }, 'Login successful');

  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourses', 'name slug thumbnail');
    
    sendSuccess(res, 200, user, 'User retrieved successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'Email already registered');
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP to DB (upsert: update if exists, insert if not)
    // Dynamic import for Otp model to avoid circular dependency issues if any, or just standard import
    // Assuming standard import works if we add it to the top
    const Otp = (await import('../models/Otp.js')).default;
    
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // TODO: Send email
    // For now, log to console
    console.log(`--------------------------------`);
    console.log(`OTP for ${email}: ${otp}`);
    console.log(`--------------------------------`);

    sendSuccess(res, 200, { email }, 'OTP sent successfully to your email');
  } catch (error) {
    console.error('Send OTP error:', error);
    sendError(res, 500, error.message);
  }
};

// @desc    Verify OTP and Register
// @route   POST /api/auth/verify-otp-register
// @access  Public
export const verifyOtpRegister = async (req, res) => {
  try {
    const { email, otp, name, password, role } = req.body;

    const Otp = (await import('../models/Otp.js')).default;

    // Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return sendError(res, 400, 'Invalid or expired OTP');
    }

    // Check if user exists (double check)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'User already exists');
    }

    const normalizedRole = role || ROLES.TEACHER;

    if (ADMIN_ROLES.includes(normalizedRole)) {
      return sendError(res, 403, 'Admin accounts can only be provisioned internally');
    }

    // Create user
    const personId = 'PDEU-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      personId,
      approvalStatus: normalizedRole === ROLES.TEACHER
        ? APPROVAL_STATUS.PENDING
        : APPROVAL_STATUS.APPROVED
    });

    // Delete OTP used
    await Otp.deleteOne({ email });

    if (normalizedRole === ROLES.TEACHER) {
      return sendSuccess(res, 201, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
        requiresApproval: true
      }, 'Teacher registration submitted for admin approval');
    }

    const token = generateToken(user._id);

    sendSuccess(res, 201, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
      token
    }, 'User registered successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/update-details
// @access  Private
export const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email, // Allow email update? Usually requires verify. Let's allow for now as per "changeable".
        phone: req.body.phone,
        address: req.body.address,
        school: req.body.school,
        socialLinks: req.body.socialLinks
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

    // Handle Image Upload
    if (req.file) {
        fieldsToUpdate.image = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    sendSuccess(res, 200, user, 'Profile updated successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
