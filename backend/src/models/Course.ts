import mongoose from 'mongoose';
import { COURSE_STATUS } from '../config/roles.js';

export interface ILecture {
  title: string;
  description?: string;
  summary?: string;
  thumbnail?: string;
  notes?: string;
  videoUrl?: string;
  duration?: string;
  status: 'locked' | 'unlocked';
  order?: number;
}

export interface IPart {
  title: string;
  lectures: ILecture[];
  resources: boolean;
  order?: number;
}

export interface ICourse extends mongoose.Document {
  name: string;
  slug: string;
  category: string;
  subtitle?: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  provider?: string;
  price: number;
  thumbnail?: string;
  videoPreview?: string;
  stats: {
    parts: number;
    rating: number;
    reviews: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    totalHours: number;
    shareable: boolean;
  };
  whatYouLearn: string[];
  parts: IPart[];
  status: keyof typeof COURSE_STATUS;
  isFeatured: boolean;
  featuredAt?: Date;
  archivedAt?: Date;
  rejectionReason: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  enrolledStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  summary: String,
  thumbnail: String,
  notes: String,
  videoUrl: String,
  duration: String,
  status: {
    type: String,
    enum: ['locked', 'unlocked'],
    default: 'locked'
  },
  order: Number
});

const partSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  lectures: [lectureSchema],
  resources: {
    type: Boolean,
    default: false
  },
  order: Number
});

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a course name'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  subtitle: String,
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  thumbnail: String,
  videoPreview: String,
  stats: {
    parts: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    totalHours: { type: Number, default: 0 },
    shareable: { type: Boolean, default: true }
  },
  whatYouLearn: [String],
  parts: [partSchema],
  status: {
    type: String,
    enum: Object.values(COURSE_STATUS),
    default: COURSE_STATUS.PENDING
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: {
    type: Date
  },
  archivedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update stats before saving
courseSchema.pre('save', function(next) {
  this.stats.parts = this.parts.length;
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model<ICourse>('Course', courseSchema);
