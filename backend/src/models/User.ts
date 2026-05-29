import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { APPROVAL_STATUS, ROLES, USER_STATUS } from '../config/roles.js';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: keyof typeof ROLES;
  status: keyof typeof USER_STATUS;
  approvalStatus: keyof typeof APPROVAL_STATUS;
  approvalNote: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  enrolledCourses: mongoose.Types.ObjectId[];
  cart: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  image: string;
  address: string;
  birthday?: Date;
  personId?: string;
  school: string;
  socialLinks: {
    linkedin: string;
    github: string;
    instagram: string;
  };
  lastLoginAt?: Date;
  lastLoginIp: string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.STUDENT
  },
  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE,
    index: true
  },
  approvalStatus: {
    type: String,
    enum: Object.values(APPROVAL_STATUS),
    default: function getDefaultApprovalStatus() {
      return this.role === ROLES.TEACHER ? APPROVAL_STATUS.PENDING : APPROVAL_STATUS.APPROVED;
    },
    index: true
  },
  approvalNote: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Profile Fields
  image: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  birthday: {
    type: Date
  },
  personId: {
    type: String,
    unique: true,
    sparse: true // Allows null/unique if not set immediately, though we will set it
  },
  school: {
    type: String,
    default: ''
  },
  socialLinks: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  lastLoginAt: {
    type: Date
  },
  lastLoginIp: {
    type: String,
    default: ''
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    this.updatedAt = Date.now();
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = Date.now();
  return next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ role: 1, status: 1, school: 1, approvalStatus: 1 });

export default mongoose.model<IUser>('User', userSchema);
