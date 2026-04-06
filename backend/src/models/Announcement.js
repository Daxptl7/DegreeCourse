import mongoose from 'mongoose';
import { ROLES } from '../config/roles.js';

const announcementAudienceSchema = new mongoose.Schema({
  schools: [{
    type: String,
    trim: true
  }],
  courseIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  roles: [{
    type: String,
    enum: Object.values(ROLES)
  }]
}, { _id: false });

const announcementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['course', 'platform'],
    default: 'course'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: function isCourseAnnouncement() {
      return this.type === 'course';
    }
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function isCourseAnnouncement() {
      return this.type === 'course';
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  audience: {
    type: announcementAudienceSchema,
    default: () => ({
      schools: [],
      courseIds: [],
      roles: []
    })
  },
  channel: {
    type: String,
    enum: ['banner', 'notification', 'email'],
    default: 'banner'
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'critical'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'published'
  },
  scheduledFor: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

announcementSchema.pre('save', function updateAnnouncementTimestamp(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Announcement', announcementSchema);
